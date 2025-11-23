import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedResumeMatch = await deploy("ResumeMatch", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });

  console.log(`ResumeMatch contract: `, deployedResumeMatch.address);
};
export default func;
func.id = "deploy_resumeMatch"; // id required to prevent reexecution
func.tags = ["ResumeMatch"];

