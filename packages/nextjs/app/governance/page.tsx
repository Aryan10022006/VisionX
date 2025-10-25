"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { RegisteredRoute } from "~~/components/ProtectedRoute";
import { Address } from "~~/components/scaffold-eth";

const GovernancePage = () => {
  const { address: connectedAddress } = useAccount();
  
  // Form states
  const [proposalPropertyId, setProposalPropertyId] = useState("1");
  const [proposalDescription, setProposalDescription] = useState("");

  // Read proposals (checking first 10)
  const { data: proposal1, refetch: refetchProposal1 } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getProposal",
    args: [1n],
  });

  const { data: proposalCount } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "proposalCount",
  });

  // Read user's shares for voting power
  const { data: userSharesForProp1 } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getSharesBalance",
    args: [1n, connectedAddress],
  });

  // Write functions
  const { writeContractAsync: createProposal, isMining: isCreatingProposal } = useScaffoldWriteContract({
    contractName: "PropShare",
  });

  const { writeContractAsync: vote, isMining: isVoting } = useScaffoldWriteContract({
    contractName: "PropShare",
  });

  const { writeContractAsync: executeProposal, isMining: isExecuting } = useScaffoldWriteContract({
    contractName: "PropShare",
  });

  // Handlers
  const handleCreateProposal = async () => {
    if (!proposalPropertyId || !proposalDescription) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await createProposal({
        functionName: "createProposal",
        args: [BigInt(proposalPropertyId), proposalDescription],
      });

      alert("Proposal created successfully!");
      setProposalDescription("");
      refetchProposal1();
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal. Make sure you own shares in the property.");
    }
  };

  const handleVote = async (proposalId: bigint, voteYes: boolean) => {
    try {
      await vote({
        functionName: "vote",
        args: [proposalId, voteYes],
      });

      alert(`Vote ${voteYes ? "YES" : "NO"} submitted successfully!`);
      refetchProposal1();
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote. Make sure you haven't voted already and own shares.");
    }
  };

  const handleExecute = async (proposalId: bigint) => {
    try {
      await executeProposal({
        functionName: "executeProposal",
        args: [proposalId],
      });

      alert("Proposal executed successfully!");
      refetchProposal1();
    } catch (error) {
      console.error("Error executing proposal:", error);
      alert("Failed to execute proposal. Check if voting deadline has passed and proposal passed.");
    }
  };

  return (
    <RegisteredRoute>
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Governance</h1>
            <p className="text-base-content/60">
              Participate in property decisions through decentralized voting
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<ChartBarIcon className="w-8 h-8" />}
              label="Total Proposals"
              value={(proposalCount ? Number(proposalCount) : 0).toString()}
            />
            <StatCard
              icon={<CheckCircleIcon className="w-8 h-8" />}
              label="Your Voting Power (Property #1)"
              value={userSharesForProp1?.toString() || "0"}
            />
            <StatCard
              icon={<ClockIcon className="w-8 h-8" />}
              label="Active Proposals"
              value={proposal1 && proposal1.id !== 0n && !proposal1.executed ? "1" : "0"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Proposal Form */}
            <div className="lg:col-span-1">
              <div className="bg-base-100 rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Create Proposal</h2>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Property ID</span>
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      className="input input-bordered"
                      value={proposalPropertyId}
                      onChange={(e) => setProposalPropertyId(e.target.value)}
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        Your voting power: {userSharesForProp1?.toString() || "0"} shares
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Proposal Description</span>
                    </label>
                    <textarea
                      placeholder="e.g., Approve $10,000 for roof renovation"
                      className="textarea textarea-bordered h-32"
                      value={proposalDescription}
                      onChange={(e) => setProposalDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    onClick={handleCreateProposal}
                    disabled={isCreatingProposal || !userSharesForProp1 || userSharesForProp1 === 0n}
                  >
                    {isCreatingProposal ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Proposal"
                    )}
                  </button>

                  {(!userSharesForProp1 || userSharesForProp1 === 0n) && (
                    <div className="alert alert-warning text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>You need to own shares to create proposals</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proposals List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold">Active Proposals</h2>

              {proposal1 && proposal1.id !== 0n ? (
                <ProposalCard
                  proposal={{
                    id: proposal1.id,
                    propertyId: proposal1.propertyId,
                    description: proposal1.description,
                    deadline: 0n, // Not in our contract
                    yesVotes: proposal1.votesFor,
                    noVotes: proposal1.votesAgainst,
                    executed: proposal1.executed,
                    creator: proposal1.creator,
                  }}
                  userVotingPower={userSharesForProp1 || 0n}
                  onVote={handleVote}
                  onExecute={handleExecute}
                  isVoting={isVoting}
                  isExecuting={isExecuting}
                />
              ) : (
                <div className="bg-base-100 rounded-xl shadow-lg p-12 text-center">
                  <ChartBarIcon className="w-20 h-20 mx-auto text-base-content/20 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-base-content/60">No Proposals Yet</h3>
                  <p className="text-base-content/50">
                    Create the first proposal to start governance
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RegisteredRoute>
  );
};

// Component Definitions
const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-base-100 rounded-xl shadow-lg p-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg text-primary">
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-base-content/60">{label}</div>
      </div>
    </div>
  </div>
);

interface ProposalCardProps {
  proposal: {
    id: bigint;
    propertyId: bigint;
    description: string;
    deadline: bigint;
    yesVotes: bigint;
    noVotes: bigint;
    executed: boolean;
    creator: string;
  };
  userVotingPower: bigint;
  onVote: (proposalId: bigint, voteYes: boolean) => void;
  onExecute: (proposalId: bigint) => void;
  isVoting: boolean;
  isExecuting: boolean;
}

const ProposalCard = ({
  proposal,
  userVotingPower,
  onVote,
  onExecute,
  isVoting,
  isExecuting,
}: ProposalCardProps) => {
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPercentage = totalVotes > 0n ? Number((proposal.yesVotes * 100n) / totalVotes) : 0;
  const noPercentage = totalVotes > 0n ? Number((proposal.noVotes * 100n) / totalVotes) : 0;

  const deadlineDate = new Date(Number(proposal.deadline) * 1000);
  const isVotingActive = Date.now() < deadlineDate.getTime();
  const hasPassed = proposal.yesVotes > proposal.noVotes;

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="card-title">Proposal #{proposal.id.toString()}</h3>
            <p className="text-sm text-base-content/60">Property #{proposal.propertyId.toString()}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {proposal.executed ? (
              <span className="badge badge-success">Executed</span>
            ) : isVotingActive ? (
              <span className="badge badge-primary">Active</span>
            ) : hasPassed ? (
              <span className="badge badge-info">Passed</span>
            ) : (
              <span className="badge badge-error">Failed</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-base-content/80 mb-4">{proposal.description}</p>

        {/* Creator */}
        <div className="mb-4 text-sm">
          <span className="text-base-content/60">Created by:</span>
          <Address address={proposal.creator} />
        </div>

        {/* Voting Progress */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-success" />
                Yes Votes
              </span>
              <span>{proposal.yesVotes.toString()} ({yesPercentage}%)</span>
            </div>
            <progress className="progress progress-success w-full" value={yesPercentage} max="100"></progress>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-error" />
                No Votes
              </span>
              <span>{proposal.noVotes.toString()} ({noPercentage}%)</span>
            </div>
            <progress className="progress progress-error w-full" value={noPercentage} max="100"></progress>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
          <ClockIcon className="w-5 h-5" />
          <span>
            {isVotingActive
              ? `Voting ends: ${deadlineDate.toLocaleString()}`
              : `Ended: ${deadlineDate.toLocaleString()}`}
          </span>
        </div>

        {/* Actions */}
        <div className="card-actions justify-end">
          {isVotingActive && !proposal.executed && userVotingPower > 0n && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => onVote(proposal.id, true)}
                disabled={isVoting}
              >
                Vote YES
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => onVote(proposal.id, false)}
                disabled={isVoting}
              >
                Vote NO
              </button>
            </>
          )}

          {!isVotingActive && !proposal.executed && hasPassed && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onExecute(proposal.id)}
              disabled={isExecuting}
            >
              {isExecuting ? "Executing..." : "Execute Proposal"}
            </button>
          )}

          {userVotingPower === 0n && isVotingActive && (
            <div className="text-sm text-base-content/60">
              You need to own shares to vote
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GovernancePage;
