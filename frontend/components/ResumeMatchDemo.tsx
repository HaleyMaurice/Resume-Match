"use client";

import { useState } from "react";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useResumeMatch } from "@/hooks/useResumeMatch";

const SKILL_VECTOR_SIZE = 10;
const SKILL_NAMES = [
  "Programming",
  "Design",
  "Marketing",
  "Management",
  "Communication",
  "Analytics",
  "Problem Solving",
  "Teamwork",
  "Leadership",
  "Innovation",
];

type TabType = "jobs" | "profile" | "match";

export const ResumeMatchDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const resumeMatch = useResumeMatch({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [jobSearchQuery, setJobSearchQuery] = useState<string>("");

  // Profile form state
  const [profileSkills, setProfileSkills] = useState<number[]>(
    new Array(SKILL_VECTOR_SIZE).fill(50)
  );
  const [profileExperience, setProfileExperience] = useState<number>(0);
  const [profileSoftSkills, setProfileSoftSkills] = useState<number>(50);

  // Job requirement form state
  const [jobSkillWeights, setJobSkillWeights] = useState<number[]>(
    new Array(SKILL_VECTOR_SIZE).fill(10)
  );
  const [jobMinExperience, setJobMinExperience] = useState<number>(0);
  const [jobSoftSkillWeight, setJobSoftSkillWeight] = useState<number>(10);

  // Match computation state - no longer needed as we use selected job and current user

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-lg w-full mx-4 border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-600 text-white p-4 rounded-full mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              ResumeMatch
            </h1>
            <p className="text-lg text-gray-600">
              Privacy-Preserving Resume Matching with FHEVM
            </p>
          </div>
          <button
            onClick={connect}
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Connect MetaMask Wallet
          </button>
          <p className="text-sm text-gray-500 text-center mt-6">
            Secure and encrypted job matching powered by blockchain
          </p>
        </div>
      </div>
    );
  }

  // Only show deployment warning if chainId is defined and contract is not deployed
  if (chainId !== undefined && resumeMatch.isDeployed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-red-200">
          <div className="text-center">
            <div className="inline-block bg-red-100 text-red-600 p-4 rounded-full mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contract Not Found
            </h2>
            <p className="text-gray-700 mb-3">
              The ResumeMatch contract is not deployed on this network.
            </p>
            <div className="bg-gray-50 rounded px-4 py-2 inline-block">
              <p className="text-sm text-gray-600">
                Network Chain ID: <span className="font-mono font-semibold text-gray-900">{chainId}</span>
            </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">ResumeMatch</h1>
                <p className="text-sm text-gray-600 mt-1">
                Privacy-Preserving Resume Matching with FHEVM
              </p>
            </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Network</p>
                <p className="text-sm font-bold text-gray-900">
                  {chainId === 31337 ? "Localhost" : `Chain ${chainId}`}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">FHEVM Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    fhevmStatus === "ready" ? "bg-green-500" : 
                    fhevmStatus === "error" ? "bg-red-500" : "bg-yellow-500"
                  }`}></div>
                  <p className={`text-sm font-bold capitalize ${
                    fhevmStatus === "ready" ? "text-green-700" : 
                    fhevmStatus === "error" ? "text-red-700" : "text-yellow-700"
                  }`}>
                  {fhevmStatus}
                </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
            resumeMatch.hasProfile ? "border-green-500" : "border-gray-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                resumeMatch.hasProfile ? "bg-green-100" : "bg-gray-100"
              }`}>
                <svg className={`w-8 h-8 ${resumeMatch.hasProfile ? "text-green-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Your Profile</p>
            <p className={`text-xl font-bold ${resumeMatch.hasProfile ? "text-green-700" : "text-gray-700"}`}>
              {resumeMatch.hasProfile ? "Submitted" : "Not Submitted"}
                </p>
              </div>

          <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
            resumeMatch.hasJobRequirement ? "border-purple-500" : "border-gray-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                resumeMatch.hasJobRequirement ? "bg-purple-100" : "bg-gray-100"
              }`}>
                <svg className={`w-8 h-8 ${resumeMatch.hasJobRequirement ? "text-purple-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Job Requirement</p>
            <p className={`text-xl font-bold ${resumeMatch.hasJobRequirement ? "text-purple-700" : "text-gray-700"}`}>
              {resumeMatch.hasJobRequirement ? "Submitted" : "Not Submitted"}
            </p>
          </div>

          <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
            resumeMatch.clearMatchScore !== undefined ? "border-blue-500" : "border-gray-300"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                resumeMatch.clearMatchScore !== undefined ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <svg className={`w-8 h-8 ${resumeMatch.clearMatchScore !== undefined ? "text-blue-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Match Score</p>
            <p className={`text-xl font-bold ${resumeMatch.clearMatchScore !== undefined ? "text-blue-700" : "text-gray-700"}`}>
              {resumeMatch.clearMatchScore !== undefined ? `${resumeMatch.clearMatchScore}` : "Not Computed"}
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="border-b-2 border-gray-100">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab("jobs");
                  setShowJobModal(false);
                  setSelectedJob(null);
                }}
                className={`py-4 px-8 font-semibold text-sm border-b-4 transition-all flex items-center gap-2 ${
                  activeTab === "jobs"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Jobs
              </button>
            </nav>
              </div>

          <div className="p-8">
            {/* Jobs Tab */}
            {activeTab === "jobs" && !showJobModal && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Available Jobs
                    </h3>
                    <p className="text-gray-600">
                      Select a job to submit your profile and compute your match score.
                    </p>
            </div>
          </div>

                {/* Search Bar */}
                {resumeMatch.jobs.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={jobSearchQuery}
                        onChange={(e) => setJobSearchQuery(e.target.value)}
                        placeholder="Search by job number (e.g., 61964505)"
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                      />
                      <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      {jobSearchQuery && (
                        <button
                          onClick={() => setJobSearchQuery("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Filtered Jobs */}
                {(() => {
                  const filteredJobs = jobSearchQuery
                    ? resumeMatch.jobs.filter((job) => {
                        const jobNumber = job.id.slice(-8);
                        return jobNumber.includes(jobSearchQuery) || job.id.includes(jobSearchQuery);
                      })
                    : resumeMatch.jobs;

                  return filteredJobs.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-2">No jobs available yet</p>
                    <p className="text-sm text-gray-500">
                      Jobs will appear here after employers submit job requirements.
                </p>
              </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => {
                          setSelectedJob(job.id);
                          setShowJobModal(true);
                          setActiveTab("profile");
                        }}
                        className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                          selectedJob === job.id
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-blue-400"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            #{job.id.slice(-8)}
              </div>
                          {selectedJob === job.id && (
                            <div className="flex items-center gap-1 text-blue-700 text-sm font-bold">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Selected
            </div>
                          )}
          </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded px-3 py-2 border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 mb-1">Employer</p>
                            <p className="font-mono text-xs text-gray-900">{job.employer.slice(0, 10)}...{job.employer.slice(-8)}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white rounded px-3 py-2 border border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-1">Experience</p>
                              <p className="text-sm font-bold text-gray-900">{job.minExperience} years</p>
                            </div>
                            <div className="bg-white rounded px-3 py-2 border border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-1">Soft Skill</p>
                              <p className="text-sm font-bold text-gray-900">{job.softSkillWeight}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                            Posted: {new Date(job.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )})()}

                <div className="mt-8 p-6 bg-purple-50 border-2 border-purple-300 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-600 text-white p-2 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
              <div>
                      <h4 className="text-lg font-bold text-purple-900">Submit New Job Requirement</h4>
                      <p className="text-sm text-purple-700">
                        Employers can post encrypted job requirements here.
                </p>
              </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3">
                        Skill Weights (0-100 each)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {jobSkillWeights.map((weight, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                              {SKILL_NAMES[index]}
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={weight}
                              onChange={(e) => {
                                const newWeights = [...jobSkillWeights];
                                newWeights[index] = Math.min(
                                  100,
                                  Math.max(0, parseInt(e.target.value) || 0)
                                );
                                setJobSkillWeights(newWeights);
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-semibold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Minimum Experience (years)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={jobMinExperience}
                          onChange={(e) =>
                            setJobMinExperience(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-semibold"
                        />
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Soft Skill Weight (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={jobSoftSkillWeight}
                          onChange={(e) =>
                            setJobSoftSkillWeight(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        resumeMatch.submitJobRequirement(
                          jobSkillWeights,
                          jobMinExperience,
                          jobSoftSkillWeight
                        )
                      }
                      disabled={resumeMatch.isSubmitting || !fhevmInstance}
                      className="w-full bg-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {resumeMatch.isSubmitting ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Encrypting and Submitting...
                        </span>
                      ) : (
                        "Submit Encrypted Job Requirement"
                      )}
                    </button>
              </div>
            </div>
              </div>
            )}

          </div>
        </div>

        {/* Job Modal */}
        {showJobModal && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Job #{(() => {
                        const job = resumeMatch.jobs.find((j) => j.id === selectedJob);
                        return job ? job.id.slice(-8) : "";
                      })()}
                    </h2>
                    <p className="text-sm text-gray-600">Submit your profile and compute match score</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setSelectedJob(null);
                    setActiveTab("jobs");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Tabs */}
          <div className="border-b border-gray-200">
                <nav className="flex -mb-px px-6">
              <button
                onClick={() => setActiveTab("profile")}
                    className={`py-4 px-6 font-semibold text-sm border-b-4 transition-all flex items-center gap-2 ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Submit Profile
              </button>
              <button
                onClick={() => setActiveTab("match")}
                    className={`py-4 px-6 font-semibold text-sm border-b-4 transition-all flex items-center gap-2 ${
                  activeTab === "match"
                    ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Compute Match
              </button>
            </nav>
          </div>

              {/* Modal Content */}
              <div className="p-8">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-600 text-white p-2 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Your Encrypted Profile
                  </h3>
                      <p className="text-sm text-green-800">
                        All data will be encrypted before submission using FHEVM technology.
                  </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4">
                    Your Skills (Rate 0-100 for each skill)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {profileSkills.map((skill, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          {SKILL_NAMES[index]}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...profileSkills];
                            newSkills[index] = Math.min(
                              100,
                              Math.max(0, parseInt(e.target.value) || 0)
                            );
                            setProfileSkills(newSkills);
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-bold text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                    <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={profileExperience}
                      onChange={(e) =>
                        setProfileExperience(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-bold text-center text-lg"
                    />
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                    <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Soft Skills Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={profileSoftSkills}
                      onChange={(e) =>
                        setProfileSoftSkills(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-bold text-center text-lg"
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    resumeMatch.submitProfile(
                      profileSkills,
                      profileExperience,
                      profileSoftSkills
                    )
                  }
                  disabled={resumeMatch.isSubmitting || !fhevmInstance}
                  className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {resumeMatch.isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Encrypting and Submitting...
                    </span>
                  ) : (
                    "Submit Encrypted Profile"
                  )}
                </button>
              </div>
            )}

                {/* Match Tab */}
                {activeTab === "match" && (
              <div className="space-y-8">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Compute Match Score
                  </h3>
                      <p className="text-sm text-blue-800">
                        Calculate the compatibility between your profile and the job using encrypted computation.
                  </p>
                    </div>
                  </div>
                </div>

                {(() => {
                  const job = resumeMatch.jobs.find((j) => j.id === selectedJob);
                  if (!job) return null;
                  
                  return (
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Selected Job Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Employer Address</p>
                          <p className="font-mono text-sm text-gray-900 break-all">{job.employer.slice(0, 14)}...{job.employer.slice(-10)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Minimum Experience</p>
                          <p className="text-2xl font-bold text-gray-900">{job.minExperience} <span className="text-sm font-normal text-gray-600">years</span></p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-1">Soft Skill Weight</p>
                          <p className="text-2xl font-bold text-gray-900">{job.softSkillWeight}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={async () => {
                      if (!ethersSigner || !selectedJob) return;
                      const job = resumeMatch.jobs.find((j) => j.id === selectedJob);
                      if (!job) return;
                      const userAddress = await ethersSigner.getAddress();
                      await resumeMatch.computeMatch(userAddress, job.employer);
                    }}
                    disabled={
                      resumeMatch.isComputing ||
                      !selectedJob ||
                      !ethersSigner ||
                      !fhevmInstance
                    }
                    className="bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 flex items-center justify-center gap-3"
                  >
                    {resumeMatch.isComputing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Computing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Compute Match Score
                      </>
                    )}
                  </button>
                  <button
                    onClick={resumeMatch.decryptMatchScore}
                    disabled={
                      resumeMatch.isDecrypting ||
                      !resumeMatch.matchScoreHandle ||
                      !fhevmInstance
                    }
                    className="bg-orange-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 flex items-center justify-center gap-3"
                  >
                    {resumeMatch.isDecrypting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Decrypting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Decrypt Score
                      </>
                    )}
                  </button>
                </div>

                {resumeMatch.clearMatchScore !== undefined && (
                  <div className="bg-white border-4 border-green-500 rounded-lg p-8 text-center shadow-2xl">
                    <div className="inline-block bg-green-100 text-green-700 p-4 rounded-full mb-4">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-600 mb-2">Your Match Score</p>
                    <p className="text-6xl font-bold text-green-600 mb-3">
                      {String(resumeMatch.clearMatchScore)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Higher scores indicate better compatibility with the job requirements.
                    </p>
                  </div>
                )}
              </div>
            )}

              </div>
            </div>
          </div>
        )}

        {/* Message Display */}
        {resumeMatch.message && (
          <div className={`rounded-lg shadow-lg border-l-4 p-5 ${
            resumeMatch.message.toLowerCase().includes("failed") ||
            resumeMatch.message.toLowerCase().includes("error")
              ? "bg-red-50 border-red-500"
              : resumeMatch.message.toLowerCase().includes("success") ||
                resumeMatch.message.toLowerCase().includes("completed")
              ? "bg-green-50 border-green-500"
              : "bg-blue-50 border-blue-500"
          }`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {resumeMatch.message.toLowerCase().includes("failed") ||
                resumeMatch.message.toLowerCase().includes("error") ? (
                  <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : resumeMatch.message.toLowerCase().includes("success") ||
                  resumeMatch.message.toLowerCase().includes("completed") ? (
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  resumeMatch.message.toLowerCase().includes("failed") ||
                  resumeMatch.message.toLowerCase().includes("error")
                    ? "text-red-800"
                    : resumeMatch.message.toLowerCase().includes("success") ||
                      resumeMatch.message.toLowerCase().includes("completed")
                    ? "text-green-800"
                    : "text-blue-800"
                }`}>{resumeMatch.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
