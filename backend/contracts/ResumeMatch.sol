// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ResumeMatch - Privacy-preserving resume matching DApp
/// @notice Allows job seekers to submit encrypted resume profiles and employers to submit encrypted job requirements
/// @notice Performs encrypted matching score calculations on-chain without revealing any sensitive data
/// @dev Uses FHEVM for fully homomorphic encryption operations
contract ResumeMatch is ZamaEthereumConfig {
    // Constants
    uint32 public constant SKILL_VECTOR_SIZE = 10; // 10-dimensional skill vector
    uint32 public constant MAX_SKILL_SCORE = 100; // Maximum skill score (0-100)
    uint32 public constant MAX_EXPERIENCE = 50; // Maximum years of experience
    
    // Profile structure
    struct EncryptedProfile {
        euint32[SKILL_VECTOR_SIZE] skills; // Encrypted skill scores (0-100)
        euint32 experience; // Encrypted years of experience
        euint32 softSkills; // Encrypted soft skills score (0-100)
        address owner; // Profile owner address
        bool exists; // Whether profile exists
    }
    
    // Job requirement structure
    struct EncryptedJobRequirement {
        euint32[SKILL_VECTOR_SIZE] skillWeights; // Encrypted skill weights
        euint32 minExperience; // Encrypted minimum experience requirement
        euint32 softSkillWeight; // Encrypted soft skill weight
        address employer; // Employer address
        bool exists; // Whether job requirement exists
    }
    
    // Match result structure
    struct MatchResult {
        euint32 score; // Encrypted match score
        address profileOwner; // Profile owner
        address employer; // Employer
        bool exists; // Whether match result exists
    }
    
    // Storage
    mapping(address => EncryptedProfile) public profiles;
    mapping(address => EncryptedJobRequirement) public jobRequirements;
    mapping(address => mapping(address => MatchResult)) public matchResults; // profileOwner => employer => MatchResult
    
    // Events
    event ProfileSubmitted(address indexed owner);
    event JobRequirementSubmitted(address indexed employer);
    event MatchComputed(address indexed profileOwner, address indexed employer);
    
    /// @notice Submit an encrypted resume profile
    /// @param encryptedSkills Array of encrypted skill scores (10 values)
    /// @param encryptedExperience Encrypted years of experience
    /// @param encryptedSoftSkills Encrypted soft skills score
    /// @param inputProof Input proof for verification
    function submitEncryptedProfile(
        externalEuint32[SKILL_VECTOR_SIZE] calldata encryptedSkills,
        externalEuint32 encryptedExperience,
        externalEuint32 encryptedSoftSkills,
        bytes calldata inputProof
    ) external {
        // Convert external encrypted inputs to internal encrypted types
        euint32[SKILL_VECTOR_SIZE] memory skills;
        for (uint32 i = 0; i < SKILL_VECTOR_SIZE; i++) {
            skills[i] = FHE.fromExternal(encryptedSkills[i], inputProof);
        }
        
        euint32 experience = FHE.fromExternal(encryptedExperience, inputProof);
        euint32 softSkills = FHE.fromExternal(encryptedSoftSkills, inputProof);
        
        // Store profile
        profiles[msg.sender] = EncryptedProfile({
            skills: skills,
            experience: experience,
            softSkills: softSkills,
            owner: msg.sender,
            exists: true
        });
        
        // Grant ACL permissions for the profile owner
        for (uint32 i = 0; i < SKILL_VECTOR_SIZE; i++) {
            FHE.allowThis(skills[i]);
            FHE.allow(skills[i], msg.sender);
        }
        FHE.allowThis(experience);
        FHE.allow(experience, msg.sender);
        FHE.allowThis(softSkills);
        FHE.allow(softSkills, msg.sender);
        
        emit ProfileSubmitted(msg.sender);
    }
    
    /// @notice Submit an encrypted job requirement
    /// @param encryptedSkillWeights Array of encrypted skill weights (10 values)
    /// @param encryptedMinExperience Encrypted minimum experience requirement
    /// @param encryptedSoftSkillWeight Encrypted soft skill weight
    /// @param inputProof Input proof for verification
    function submitJobRequirement(
        externalEuint32[SKILL_VECTOR_SIZE] calldata encryptedSkillWeights,
        externalEuint32 encryptedMinExperience,
        externalEuint32 encryptedSoftSkillWeight,
        bytes calldata inputProof
    ) external {
        // Convert external encrypted inputs to internal encrypted types
        euint32[SKILL_VECTOR_SIZE] memory skillWeights;
        for (uint32 i = 0; i < SKILL_VECTOR_SIZE; i++) {
            skillWeights[i] = FHE.fromExternal(encryptedSkillWeights[i], inputProof);
        }
        
        euint32 minExperience = FHE.fromExternal(encryptedMinExperience, inputProof);
        euint32 softSkillWeight = FHE.fromExternal(encryptedSoftSkillWeight, inputProof);
        
        // Store job requirement
        jobRequirements[msg.sender] = EncryptedJobRequirement({
            skillWeights: skillWeights,
            minExperience: minExperience,
            softSkillWeight: softSkillWeight,
            employer: msg.sender,
            exists: true
        });
        
        // Grant ACL permissions for the employer
        for (uint32 i = 0; i < SKILL_VECTOR_SIZE; i++) {
            FHE.allowThis(skillWeights[i]);
            FHE.allow(skillWeights[i], msg.sender);
        }
        FHE.allowThis(minExperience);
        FHE.allow(minExperience, msg.sender);
        FHE.allowThis(softSkillWeight);
        FHE.allow(softSkillWeight, msg.sender);
        
        emit JobRequirementSubmitted(msg.sender);
    }
    
    /// @notice Compute match score between a profile and a job requirement
    /// @param profileOwner Address of the profile owner
    /// @param employer Address of the employer
    /// @return The encrypted match score
    function computeMatchScore(
        address profileOwner,
        address employer
    ) external returns (euint32) {
        require(profiles[profileOwner].exists, "Profile does not exist");
        require(jobRequirements[employer].exists, "Job requirement does not exist");
        
        EncryptedProfile memory profile = profiles[profileOwner];
        EncryptedJobRequirement memory job = jobRequirements[employer];
        
        // Initialize match score
        euint32 matchScore = FHE.asEuint32(0);
        
        // Calculate weighted skill score: Σ(skill[i] * weight[i])
        for (uint32 i = 0; i < SKILL_VECTOR_SIZE; i++) {
            euint32 skillContribution = FHE.mul(profile.skills[i], job.skillWeights[i]);
            matchScore = FHE.add(matchScore, skillContribution);
        }
        
        // Add experience score (if experience >= minExperience, add bonus)
        // Using a simple approach: if experience >= minExperience, add 50 points
        ebool experienceMet = FHE.ge(profile.experience, job.minExperience);
        euint32 experienceBonus = FHE.select(experienceMet, FHE.asEuint32(50), FHE.asEuint32(0));
        matchScore = FHE.add(matchScore, experienceBonus);
        
        // Add soft skills contribution
        euint32 softSkillContribution = FHE.mul(profile.softSkills, job.softSkillWeight);
        matchScore = FHE.add(matchScore, softSkillContribution);
        
        // Normalize score (divide by 100 to get percentage-like score)
        // Note: In FHE, division by constant is supported
        matchScore = FHE.div(matchScore, 100);
        
        // Store match result
        matchResults[profileOwner][employer] = MatchResult({
            score: matchScore,
            profileOwner: profileOwner,
            employer: employer,
            exists: true
        });
        
        // Grant ACL permissions for both parties
        FHE.allowThis(matchScore);
        FHE.allow(matchScore, profileOwner);
        FHE.allow(matchScore, employer);
        
        emit MatchComputed(profileOwner, employer);
        
        return matchScore;
    }
    
    /// @notice Get the encrypted match score for a profile-employer pair
    /// @param profileOwner Address of the profile owner
    /// @param employer Address of the employer
    /// @return The encrypted match score
    function getMatchScore(
        address profileOwner,
        address employer
    ) external view returns (euint32) {
        require(matchResults[profileOwner][employer].exists, "Match result does not exist");
        return matchResults[profileOwner][employer].score;
    }
    
    /// @notice Check if a profile exists
    /// @param owner Address of the profile owner
    /// @return Whether the profile exists
    function hasProfile(address owner) external view returns (bool) {
        return profiles[owner].exists;
    }
    
    /// @notice Check if a job requirement exists
    /// @param employer Address of the employer
    /// @return Whether the job requirement exists
    function hasJobRequirement(address employer) external view returns (bool) {
        return jobRequirements[employer].exists;
    }
    
    /// @notice Check if a match result exists
    /// @param profileOwner Address of the profile owner
    /// @param employer Address of the employer
    /// @return Whether the match result exists
    function hasMatchResult(address profileOwner, address employer) external view returns (bool) {
        return matchResults[profileOwner][employer].exists;
    }
}

