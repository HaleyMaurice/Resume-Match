# ResumeMatch - Privacy-Preserving Resume Matching DApp

A decentralized application (DApp) that enables privacy-preserving resume matching using Zama FHEVM technology. Job seekers can submit encrypted resume profiles, and employers can submit encrypted job requirements. The matching score is computed on-chain using fully homomorphic encryption (FHE) without revealing any sensitive data.

## Features

- **Encrypted Profile Submission**: Job seekers submit encrypted resume data (skills, experience, soft skills)
- **Encrypted Job Requirements**: Employers submit encrypted job requirements (skill weights, minimum experience, soft skill weight)
- **On-Chain Matching**: FHE computation calculates match scores without decrypting any data
- **Privacy-Preserving**: All sensitive data remains encrypted throughout the process
- **ACL Authorization**: Proper access control for encrypted data decryption

## Technology Stack

- **Backend**: Solidity 0.8.27, Hardhat, FHEVM 0.9.1
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **FHEVM**: Zama FHEVM Relayer SDK 0.3.0-5
- **Wallet**: MetaMask integration

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- MetaMask browser extension
- For local development: Hardhat node with FHEVM support

## Usage Guide

### For Job Seekers

1. **Connect Wallet**: Click "Connect to MetaMask" and approve the connection
2. **Submit Profile**:
   - Enter skill scores (0-100) for each of the 10 skills
   - Enter years of experience
   - Enter soft skills score (0-100)
   - Click "Submit Profile"
   - Wait for transaction confirmation

### For Employers

1. **Connect Wallet**: Click "Connect to MetaMask" and approve the connection
2. **Submit Job Requirement**:
   - Enter skill weights (0-100) for each of the 10 skills
   - Enter minimum experience requirement
   - Enter soft skill weight (0-100)
   - Click "Submit Job Requirement"
   - Wait for transaction confirmation

### Computing Match Scores

1. **Compute Match**:
   - Enter the profile owner address (job seeker)
   - Enter the employer address
   - Click "Compute Match"
   - Wait for transaction confirmation

2. **Decrypt Score**:
   - After computing the match, click "Decrypt Score"
   - The decrypted match score will be displayed
   - Only authorized parties (profile owner and employer) can decrypt the score

## Security Considerations

- All data is encrypted using FHEVM before submission
- ACL (Access Control List) permissions are set for encrypted data
- Only authorized parties can decrypt match scores
- All computations are performed on encrypted data
- No sensitive information is exposed on-chain

## FHEVM Integration Details

### Encryption Process

1. Frontend uses Relayer SDK to create encrypted input buffer
2. Data is encrypted locally using FHE
3. Encrypted data and zero-knowledge proof are sent to the contract
4. Contract verifies the proof and stores encrypted data

### Decryption Process

1. User requests decryption with proper ACL permissions
2. Relayer SDK generates decryption signature (EIP712)
3. Signature is verified on-chain
4. Decrypted result is returned to the authorized user

### ACL Authorization

- Profile data: Only profile owner can decrypt
- Job requirement data: Only employer can decrypt
- Match scores: Both profile owner and employer can decrypt

## Troubleshooting

### Common Issues

1. **"Contract not deployed" error**:
   - Ensure the contract is deployed on the current network
   - Check that the contract address is correctly set in `frontend/abi/ResumeMatchAddresses.ts`

2. **"FHEVM instance not ready" error**:
   - Wait for FHEVM SDK to load (may take a few seconds)
   - Check browser console for errors
   - Ensure MetaMask is connected

3. **"Decryption failed" error**:
   - Ensure you have ACL permissions for the data
   - Check that the signature is valid
   - Verify you are using the correct account

4. **Transaction failures**:
   - Ensure you have sufficient gas
   - Check that all required parameters are provided
   - Verify network connection
