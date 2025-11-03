// This file is auto-generated from contract compilation
// Run 'npm run generate:frontend' to update this file
export const abi = [
  {
    "inputs": [],
    "name": "ZamaProtocolUnsupported",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "employer",
        "type": "address"
      }
    ],
    "name": "JobRequirementSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "profileOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "employer",
        "type": "address"
      }
    ],
    "name": "MatchComputed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ProfileSubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_EXPERIENCE",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_SKILL_SCORE",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SKILL_VECTOR_SIZE",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "profileOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      }
    ],
    "name": "computeMatchScore",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "confidentialProtocolId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "profileOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      }
    ],
    "name": "getMatchScore",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      }
    ],
    "name": "hasJobRequirement",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "profileOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      }
    ],
    "name": "hasMatchResult",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "hasProfile",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "jobRequirements",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "minExperience",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "softSkillWeight",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "matchResults",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "score",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "profileOwner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "employer",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "profiles",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "experience",
        "type": "bytes32"
      },
      {
        "internalType": "euint32",
        "name": "softSkills",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint32[10]",
        "name": "encryptedSkills",
        "type": "bytes32[10]"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedExperience",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedSoftSkills",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "submitEncryptedProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint32[10]",
        "name": "encryptedSkillWeights",
        "type": "bytes32[10]"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedMinExperience",
        "type": "bytes32"
      },
      {
        "internalType": "externalEuint32",
        "name": "encryptedSoftSkillWeight",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "submitJobRequirement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
