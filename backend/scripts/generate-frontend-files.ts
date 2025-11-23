import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "ResumeMatch";
const FRONTEND_ABI_DIR = path.join(__dirname, "../../frontend/abi");
const BACKEND_ARTIFACTS_DIR = path.join(__dirname, "../artifacts/contracts");
const BACKEND_DEPLOYMENTS_DIR = path.join(__dirname, "../deployments");

// Chain ID to network name mapping
const CHAIN_ID_TO_NETWORK: Record<string, string> = {
  "31337": "localhost",
  "11155111": "sepolia",
};

// Network name to chain ID mapping
const NETWORK_TO_CHAIN_ID: Record<string, string> = {
  localhost: "31337",
  hardhat: "31337",
  anvil: "31337",
  sepolia: "11155111",
};

interface DeploymentInfo {
  address: string;
  chainId: string;
  chainName: string;
}

/**
 * Get deployment address from hardhat-deploy deployment files
 */
function getDeploymentAddress(network: string): string | null {
  const deploymentDir = path.join(BACKEND_DEPLOYMENTS_DIR, network);
  
  if (!fs.existsSync(deploymentDir)) {
    return null;
  }

  // Look for the deployment JSON file
  const deploymentFile = path.join(deploymentDir, `${CONTRACT_NAME}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    return null;
  }

  try {
    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
    return deploymentData.address || null;
  } catch (error) {
    console.error(`Error reading deployment file for ${network}:`, error);
    return null;
  }
}

/**
 * Get ABI from compiled artifacts
 */
function getContractABI(): any[] | null {
  const artifactPath = path.join(
    BACKEND_ARTIFACTS_DIR,
    `${CONTRACT_NAME}.sol`,
    `${CONTRACT_NAME}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact not found at ${artifactPath}`);
    console.error("Please run 'npm run compile' first");
    return null;
  }

  try {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    return artifact.abi || null;
  } catch (error) {
    console.error("Error reading artifact:", error);
    return null;
  }
}

/**
 * Get all deployments from deployments directory
 */
function getAllDeployments(): Map<string, DeploymentInfo> {
  const deployments = new Map<string, DeploymentInfo>();

  // Check each network directory
  if (!fs.existsSync(BACKEND_DEPLOYMENTS_DIR)) {
    console.log("No deployments directory found. Skipping address generation.");
    return deployments;
  }

  const networkDirs = fs.readdirSync(BACKEND_DEPLOYMENTS_DIR, {
    withFileTypes: true,
  });

  for (const dir of networkDirs) {
    if (!dir.isDirectory()) continue;

    const network = dir.name;
    const chainId = NETWORK_TO_CHAIN_ID[network];

    if (!chainId) {
      console.log(`Skipping unknown network: ${network}`);
      continue;
    }

    const address = getDeploymentAddress(network);
    if (address) {
      deployments.set(chainId, {
        address,
        chainId,
        chainName: CHAIN_ID_TO_NETWORK[chainId] || network,
      });
      console.log(`Found deployment for ${network} (chainId: ${chainId}): ${address}`);
    } else {
      console.log(`No deployment found for ${network} (chainId: ${chainId}), skipping`);
    }
  }

  return deployments;
}

/**
 * Generate addresses file
 */
function generateAddressesFile(deployments: Map<string, DeploymentInfo>): void {
  // Ensure directory exists
  if (!fs.existsSync(FRONTEND_ABI_DIR)) {
    fs.mkdirSync(FRONTEND_ABI_DIR, { recursive: true });
  }

  const addressesFile = path.join(FRONTEND_ABI_DIR, `${CONTRACT_NAME}Addresses.ts`);

  // Build addresses object
  const addressesObj: Record<string, DeploymentInfo> = {};
  
  // Add existing addresses if file exists (preserve non-zero addresses for networks without new deployments)
  if (fs.existsSync(addressesFile)) {
    try {
      const content = fs.readFileSync(addressesFile, "utf-8");
      // Extract existing addresses using regex
      // Match pattern: "chainId": { address: "...", chainId: ..., chainName: "..." }
      const chainIdRegex = /"(\d+)":\s*\{[^}]*address:\s*"([^"]+)"[^}]*chainId:\s*(\d+)[^}]*chainName:\s*"([^"]+)"/g;
      let match;
      while ((match = chainIdRegex.exec(content)) !== null) {
        const chainId = match[1];
        const address = match[2];
        const storedChainId = match[3];
        const chainName = match[4];
        // Keep existing address if:
        // 1. Not zero address
        // 2. Not in new deployments (new deployments will overwrite)
        if (address !== "0x0000000000000000000000000000000000000000" && !deployments.has(chainId)) {
          addressesObj[chainId] = {
            address,
            chainId: storedChainId,
            chainName,
          };
        }
      }
    } catch (error) {
      console.warn("Could not read existing addresses file, creating new one:", error);
    }
  }

  // Merge with new deployments
  for (const [chainId, info] of deployments) {
    addressesObj[chainId] = info;
  }

  // Generate file content
  const addressesContent = `// This file is auto-generated from deployment information
// Run 'npm run generate:frontend' to update this file
export default {
${Object.entries(addressesObj)
  .map(([chainId, info]) => {
    return `  "${chainId}": {
    address: "${info.address}",
    chainId: ${info.chainId},
    chainName: "${info.chainName}",
  },`;
  })
  .join("\n")}
} as const;
`;

  fs.writeFileSync(addressesFile, addressesContent, "utf-8");
  console.log(`✓ Generated ${addressesFile}`);
}

/**
 * Generate ABI file
 */
function generateABIFile(abi: any[]): void {
  // Ensure directory exists
  if (!fs.existsSync(FRONTEND_ABI_DIR)) {
    fs.mkdirSync(FRONTEND_ABI_DIR, { recursive: true });
  }

  const abiFile = path.join(FRONTEND_ABI_DIR, `${CONTRACT_NAME}ABI.ts`);

  const abiContent = `// This file is auto-generated from contract compilation
// Run 'npm run generate:frontend' to update this file
export const abi = ${JSON.stringify(abi, null, 2)} as const;
`;

  fs.writeFileSync(abiFile, abiContent, "utf-8");
  console.log(`✓ Generated ${abiFile}`);
}

/**
 * Main function
 */
function main() {
  console.log("Generating frontend files...\n");

  // Get ABI
  const abi = getContractABI();
  if (!abi) {
    console.error("Failed to get contract ABI. Please compile the contract first.");
    process.exit(1);
  }

  // Get deployments
  const deployments = getAllDeployments();

  // Generate files
  generateABIFile(abi);
  generateAddressesFile(deployments);

  console.log("\n✓ Frontend files generated successfully!");
}

main();

