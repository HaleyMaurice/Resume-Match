"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

// These files should be generated from the backend deployment
import { abi as ResumeMatchABI } from "@/abi/ResumeMatchABI";
import ResumeMatchAddresses from "@/abi/ResumeMatchAddresses";

type ResumeMatchAddressesType = typeof ResumeMatchAddresses;

export type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean;
};

export type JobInfo = {
  id: string;
  employer: string;
  skillWeights: number[];
  minExperience: number;
  softSkillWeight: number;
  submittedAt: number;
};

type ResumeMatchInfoType = {
  abi: typeof ResumeMatchABI;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

const SKILL_VECTOR_SIZE = 10;

function getResumeMatchByChainId(chainId: number | undefined): ResumeMatchInfoType {
  if (!chainId) {
    return { abi: ResumeMatchABI };
  }

  const entry = ResumeMatchAddresses[chainId.toString() as keyof ResumeMatchAddressesType];

  if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: ResumeMatchABI, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: ResumeMatchABI,
  };
}

export const useResumeMatch = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [hasJobRequirement, setHasJobRequirement] = useState<boolean>(false);
  
  // Load jobs from localStorage
  const loadJobsFromStorage = useCallback(() => {
    if (!chainId) return [];
    try {
      const storageKey = `resumematch-jobs-${chainId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as JobInfo[];
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Failed to load jobs from localStorage:", error);
    }
    return [];
  }, [chainId]);

  const [jobs, setJobs] = useState<JobInfo[]>(() => {
    // Initialize with empty array, will be loaded in useEffect
    return [];
  });
  const [matchScoreHandle, setMatchScoreHandle] = useState<string | undefined>(undefined);
  const [clearMatchScore, setClearMatchScore] = useState<ClearValueType | undefined>(undefined);
  const clearMatchScoreRef = useRef<ClearValueType>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const resumeMatchRef = useRef<ResumeMatchInfoType | undefined>(undefined);
  const isSubmittingRef = useRef<boolean>(false);
  const isComputingRef = useRef<boolean>(false);
  const isDecryptingRef = useRef<boolean>(false);

  const resumeMatch = useMemo(() => {
    const c = getResumeMatchByChainId(chainId);
    resumeMatchRef.current = c;
    // Only show deployment warning if chainId is defined and address is missing
    // Don't show warning if chainId is undefined (chain not connected yet)
    if (chainId !== undefined && !c.address) {
      setMessage(`ResumeMatch contract not found on chain ${chainId}. Please check your network connection.`);
    }
    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!resumeMatch) return undefined;
    return Boolean(resumeMatch.address) && resumeMatch.address !== ethers.ZeroAddress;
  }, [resumeMatch]);

  // Check if profile exists
  const refreshProfileStatus = useCallback(() => {
    if (!resumeMatch.address || !ethersReadonlyProvider || !ethersSigner) {
      setHasProfile(false);
      return;
    }

    const contract = new ethers.Contract(
      resumeMatch.address,
      resumeMatch.abi,
      ethersReadonlyProvider
    );

    ethersSigner.getAddress().then((address) => {
      contract.hasProfile(address)
        .then((exists: boolean) => {
          setHasProfile(exists);
        })
        .catch((e: Error) => {
          console.error("Failed to check profile:", e);
          setHasProfile(false);
        });
    });
  }, [resumeMatch.address, resumeMatch.abi, ethersReadonlyProvider, ethersSigner]);

  // Check if job requirement exists
  const refreshJobRequirementStatus = useCallback(() => {
    if (!resumeMatch.address || !ethersReadonlyProvider || !ethersSigner) {
      setHasJobRequirement(false);
      return;
    }

    const contract = new ethers.Contract(
      resumeMatch.address,
      resumeMatch.abi,
      ethersReadonlyProvider
    );

    ethersSigner.getAddress().then((address) => {
      contract.hasJobRequirement(address)
        .then((exists: boolean) => {
          setHasJobRequirement(exists);
        })
        .catch((e: Error) => {
          console.error("Failed to check job requirement:", e);
          setHasJobRequirement(false);
        });
    });
  }, [resumeMatch.address, resumeMatch.abi, ethersReadonlyProvider, ethersSigner]);

  useEffect(() => {
    refreshProfileStatus();
    refreshJobRequirementStatus();
  }, [refreshProfileStatus, refreshJobRequirementStatus]);

  // Load jobs from localStorage when chainId is available
  useEffect(() => {
    if (chainId) {
      const loadedJobs = loadJobsFromStorage();
      setJobs(loadedJobs);
    } else {
      setJobs([]);
    }
  }, [chainId, loadJobsFromStorage]);

  // Submit encrypted profile
  const submitProfile = useCallback(
    async (skills: number[], experience: number, softSkills: number) => {
      if (isSubmittingRef.current || !resumeMatch.address || !instance || !ethersSigner) {
        return;
      }

      if (skills.length !== SKILL_VECTOR_SIZE) {
        setMessage(`Please provide exactly ${SKILL_VECTOR_SIZE} skill values.`);
        return;
      }

      const thisChainId = chainId;
      const thisResumeMatchAddress = resumeMatch.address;
      const thisEthersSigner = ethersSigner;

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setMessage("Encrypting profile data...");

      const run = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisResumeMatchAddress !== resumeMatchRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          const input = instance.createEncryptedInput(
            thisResumeMatchAddress,
            thisEthersSigner.address
          );

          // Add all skills
          for (const skill of skills) {
            input.add32(BigInt(skill));
          }

          // Add experience and soft skills
          input.add32(BigInt(experience));
          input.add32(BigInt(softSkills));

          const enc = await input.encrypt();

          if (isStale()) {
            setMessage("Operation cancelled");
            return;
          }

          setMessage("Submitting profile to contract...");

          const contract = new ethers.Contract(
            thisResumeMatchAddress,
            resumeMatch.abi,
            thisEthersSigner
          );

          // Prepare encrypted skills array
          const encryptedSkills: string[] = [];
          for (let i = 0; i < SKILL_VECTOR_SIZE; i++) {
            encryptedSkills.push(ethers.hexlify(enc.handles[i]));
          }

          const tx = await contract.submitEncryptedProfile(
            encryptedSkills,
            ethers.hexlify(enc.handles[SKILL_VECTOR_SIZE]),
            ethers.hexlify(enc.handles[SKILL_VECTOR_SIZE + 1]),
            ethers.hexlify(enc.inputProof)
          );

          setMessage(`Transaction submitted: ${tx.hash.slice(0, 10)}...`);
          const receipt = await tx.wait();

          setMessage(`Profile submitted successfully!`);
          refreshProfileStatus();
        } catch (error: any) {
          setMessage(`Submit profile failed: ${error.message}`);
        } finally {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        }
      };

      run();
    },
    [ethersSigner, resumeMatch.address, resumeMatch.abi, instance, chainId, refreshProfileStatus, sameChain, sameSigner]
  );

  // Submit encrypted job requirement
  const submitJobRequirement = useCallback(
    async (skillWeights: number[], minExperience: number, softSkillWeight: number) => {
      if (isSubmittingRef.current || !resumeMatch.address || !instance || !ethersSigner) {
        return;
      }

      if (skillWeights.length !== SKILL_VECTOR_SIZE) {
        setMessage(`Please provide exactly ${SKILL_VECTOR_SIZE} skill weight values.`);
        return;
      }

      const thisChainId = chainId;
      const thisResumeMatchAddress = resumeMatch.address;
      const thisEthersSigner = ethersSigner;

      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setMessage("Encrypting job requirement data...");

      const run = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisResumeMatchAddress !== resumeMatchRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          setMessage("Creating encrypted input...");
          const input = instance.createEncryptedInput(
            thisResumeMatchAddress,
            thisEthersSigner.address
          );

          // Add all skill weights
          for (const weight of skillWeights) {
            input.add32(BigInt(weight));
          }

          // Add min experience and soft skill weight
          input.add32(BigInt(minExperience));
          input.add32(BigInt(softSkillWeight));

          setMessage("Encrypting...");
          const enc = await input.encrypt();

          if (isStale()) {
            setMessage("Operation cancelled");
            return;
          }

          setMessage("Submitting job requirement to contract...");

          const contract = new ethers.Contract(
            thisResumeMatchAddress,
            resumeMatch.abi,
            thisEthersSigner
          );

          // Prepare encrypted skill weights array
          const encryptedSkillWeights: string[] = [];
          for (let i = 0; i < SKILL_VECTOR_SIZE; i++) {
            encryptedSkillWeights.push(ethers.hexlify(enc.handles[i]));
          }

          const tx = await contract.submitJobRequirement(
            encryptedSkillWeights,
            ethers.hexlify(enc.handles[SKILL_VECTOR_SIZE]),
            ethers.hexlify(enc.handles[SKILL_VECTOR_SIZE + 1]),
            ethers.hexlify(enc.inputProof)
          );

          setMessage(`Transaction submitted: ${tx.hash.slice(0, 10)}...`);
          const receipt = await tx.wait();

          setMessage(`Job requirement submitted successfully!`);
          
          // Save job information
          const jobInfo: JobInfo = {
            id: `${thisEthersSigner.address}-${Date.now()}`,
            employer: thisEthersSigner.address,
            skillWeights: [...skillWeights],
            minExperience,
            softSkillWeight,
            submittedAt: Date.now(),
          };
          
          setJobs((prevJobs) => {
            const newJobs = [...prevJobs, jobInfo];
            // Save to localStorage
            if (thisChainId) {
              try {
                const storageKey = `resumematch-jobs-${thisChainId}`;
                localStorage.setItem(storageKey, JSON.stringify(newJobs));
              } catch (error) {
                console.error("Failed to save jobs to localStorage:", error);
              }
            }
            return newJobs;
          });
          
          refreshJobRequirementStatus();
        } catch (error: any) {
          setMessage(`Submit job requirement failed: ${error.message}`);
        } finally {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        }
      };

      run();
    },
    [ethersSigner, resumeMatch.address, resumeMatch.abi, instance, chainId, refreshJobRequirementStatus, sameChain, sameSigner]
  );

  // Compute match score
  const computeMatch = useCallback(
    async (profileOwner: string, employer: string) => {
      if (isComputingRef.current || !resumeMatch.address || !ethersSigner) {
        return;
      }

      const thisChainId = chainId;
      const thisResumeMatchAddress = resumeMatch.address;
      const thisEthersSigner = ethersSigner;

      isComputingRef.current = true;
      setIsComputing(true);
      setMessage("Computing match score...");

      const run = async () => {
        const isStale = () =>
          thisResumeMatchAddress !== resumeMatchRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          const contract = new ethers.Contract(
            thisResumeMatchAddress,
            resumeMatch.abi,
            thisEthersSigner
          );

          const tx = await contract.computeMatchScore(profileOwner, employer);
          setMessage(`Transaction submitted: ${tx.hash.slice(0, 10)}...`);
          const receipt = await tx.wait();

          if (isStale()) return;

          // Get the match score handle
          const scoreHandle = await contract.getMatchScore(profileOwner, employer);
          setMatchScoreHandle(scoreHandle);
          setMessage(`Match score computed successfully!`);
        } catch (error: any) {
          setMessage(`Compute match failed: ${error.message}`);
        } finally {
          isComputingRef.current = false;
          setIsComputing(false);
        }
      };

      run();
    },
    [ethersSigner, resumeMatch.address, resumeMatch.abi, chainId, sameChain, sameSigner]
  );

  // Decrypt match score
  const decryptMatchScore = useCallback(() => {
    if (isDecryptingRef.current || !resumeMatch.address || !instance || !ethersSigner) {
      return;
    }

    if (!matchScoreHandle) {
      setClearMatchScore(undefined);
      clearMatchScoreRef.current = undefined;
      return;
    }

    if (matchScoreHandle === ethers.ZeroHash) {
      setClearMatchScore({ handle: matchScoreHandle, clear: BigInt(0) });
      clearMatchScoreRef.current = { handle: matchScoreHandle, clear: BigInt(0) };
      return;
    }

    if (matchScoreHandle === clearMatchScoreRef.current?.handle) {
      return;
    }

    const thisChainId = chainId;
    const thisResumeMatchAddress = resumeMatch.address;
    const thisMatchScoreHandle = matchScoreHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Decrypting match score...");

    const run = async () => {
      const isStale = () =>
        thisResumeMatchAddress !== resumeMatchRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisEthersSigner);

      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [resumeMatch.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          setMessage("Unable to generate decryption signature. Please try again.");
          return;
        }

        if (isStale()) {
          setMessage("Operation cancelled due to context change");
          return;
        }

        setMessage("Decrypting your match score...");

        const res = await instance.userDecrypt(
          [{ handle: thisMatchScoreHandle, contractAddress: thisResumeMatchAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        setMessage("Decryption completed successfully!");

        if (isStale()) {
          setMessage("Operation cancelled due to context change");
          return;
        }

        setClearMatchScore({ handle: thisMatchScoreHandle, clear: res[thisMatchScoreHandle as `0x${string}`] });
        clearMatchScoreRef.current = {
          handle: thisMatchScoreHandle,
          clear: res[thisMatchScoreHandle as `0x${string}`],
        };

        setMessage(`Your match score is: ${clearMatchScoreRef.current.clear}`);
      } catch (error: any) {
        console.error("Decryption failed:", error);
        setMessage(`Decryption failed: ${error.message}`);
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    resumeMatch.address,
    instance,
    matchScoreHandle,
    chainId,
    sameChain,
    sameSigner,
  ]);

  return {
    contractAddress: resumeMatch.address,
    isDeployed,
    hasProfile,
    hasJobRequirement,
    jobs,
    matchScoreHandle,
    clearMatchScore: clearMatchScore?.clear,
    isSubmitting,
    isComputing,
    isDecrypting,
    message,
    submitProfile,
    submitJobRequirement,
    computeMatch,
    decryptMatchScore,
    refreshProfileStatus,
    refreshJobRequirementStatus,
  };
};

