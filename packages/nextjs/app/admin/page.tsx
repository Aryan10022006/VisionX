"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { AdminRoute } from "~~/components/ProtectedRoute";

const AdminPage = () => {
  const { address: connectedAddress } = useAccount();

  // Form states for tokenizing property
  const [propertyName, setPropertyName] = useState("");
  const [propertyURI, setPropertyURI] = useState("");
  const [totalShares, setTotalShares] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [managerAddress, setManagerAddress] = useState("");

  // Form state for oracle
  const [rentPropertyId, setRentPropertyId] = useState("1");
  const [verifiedRent, setVerifiedRent] = useState("");
  const [newVerifier, setNewVerifier] = useState("");

  // Read contract data
  const { data: propertyCount } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "propertyCount",
  });

  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "owner",
  });

  // Write functions
  const { writeContractAsync: tokenizeProperty, isMining: isTokenizing } = useScaffoldWriteContract({
    contractName: "PropShare",
  });

  const { writeContractAsync: submitVerifiedRent, isMining: isVerifying } = useScaffoldWriteContract({
    contractName: "PropShare",
  });

  // Handlers
  const handleTokenizeProperty = async () => {
    // Validation
    if (!propertyName.trim()) {
      alert("Please enter a property name");
      return;
    }
    if (!propertyURI.trim()) {
      alert("Please enter a property URI");
      return;
    }
    if (!totalShares || Number(totalShares) <= 0) {
      alert("Total shares must be greater than 0");
      return;
    }
    if (!pricePerShare || Number(pricePerShare) <= 0) {
      alert("Price per share must be greater than 0");
      return;
    }
    if (!managerAddress || !managerAddress.startsWith("0x")) {
      alert("Please enter a valid manager address");
      return;
    }

    try {
      console.log("Tokenizing property with params:", {
        propertyName,
        propertyURI,
        totalShares: BigInt(totalShares),
        pricePerShare: parseEther(pricePerShare),
        managerAddress,
      });

      await tokenizeProperty({
        functionName: "tokenizeProperty",
        args: [
          propertyName,
          propertyURI,
          BigInt(totalShares),
          parseEther(pricePerShare),
          managerAddress as `0x${string}`,
        ],
      });

      alert("✅ Property tokenized successfully!");
      // Reset form
      setPropertyName("");
      setPropertyURI("");
      setTotalShares("");
      setPricePerShare("");
      setManagerAddress("");
    } catch (error: any) {
      console.error("Error tokenizing property:", error);
      const errorMessage = error?.message || "Unknown error";
      alert(`❌ Failed to tokenize property:\n${errorMessage}\n\nCheck console for details.`);
    }
  };

  const handleSubmitVerifiedRent = async () => {
    // Validation
    if (!rentPropertyId || Number(rentPropertyId) <= 0) {
      alert("Please enter a valid property ID");
      return;
    }
    if (!verifiedRent || Number(verifiedRent) <= 0) {
      alert("Verified rent must be greater than 0");
      return;
    }

    try {
      console.log("Submitting verified rent:", {
        propertyId: BigInt(rentPropertyId),
        amount: parseEther(verifiedRent),
      });

      await submitVerifiedRent({
        functionName: "submitVerifiedRent",
        args: [BigInt(rentPropertyId), parseEther(verifiedRent)],
      });

      alert("✅ Rent verified successfully! Manager can now deposit this amount.");
      setVerifiedRent("");
    } catch (error: any) {
      console.error("Error verifying rent:", error);
      const errorMessage = error?.message || "Unknown error";
      alert(`❌ Failed to verify rent:\n${errorMessage}\n\nCheck console for details.`);
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-base-content/60">Manage properties, oracle, and platform settings</p>
            
            {/* Admin Status Info */}
            <div className="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm">
                <div className="font-semibold">Connected as Admin: {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}</div>
                <div className="text-xs mt-1">Contract Owner: {contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : "Loading..."}</div>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<BuildingOfficeIcon className="w-8 h-8" />}
              label="Total Properties"
              value={(propertyCount ? Number(propertyCount) : 0).toString()}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<UserGroupIcon className="w-8 h-8" />}
              label="Active Investors"
              value="250+"
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={<ChartBarIcon className="w-8 h-8" />}
              label="Total Value Locked"
              value="$2.5M"
              gradient="from-orange-500 to-red-500"
            />
            <StatCard
              icon={<ShieldCheckIcon className="w-8 h-8" />}
              label="Rent Distributed"
              value="$45K"
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tokenize Property Form */}
            <div className="bg-base-100 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BuildingOfficeIcon className="w-7 h-7" />
                Tokenize New Property
              </h2>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Property Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Luxury Apartment - Downtown Mumbai"
                    className="input input-bordered"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Property URI (Metadata)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ipfs://... or https://..."
                    className="input input-bordered"
                    value={propertyURI}
                    onChange={(e) => setPropertyURI(e.target.value)}
                  />
                  <label className="label">
                    <span className="label-text-alt">Link to IPFS metadata with property details</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Total Shares</span>
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="input input-bordered"
                    value={totalShares}
                    onChange={(e) => setTotalShares(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Price per Share (ETH)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.1"
                    className="input input-bordered"
                    value={pricePerShare}
                    onChange={(e) => setPricePerShare(e.target.value)}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Manager Address</span>
                  </label>
                  <AddressInput
                    value={managerAddress}
                    onChange={setManagerAddress}
                    placeholder="0x..."
                  />
                </div>

                <button
                  className="btn btn-primary w-full"
                  onClick={handleTokenizeProperty}
                  disabled={isTokenizing}
                >
                  {isTokenizing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Tokenizing...
                    </>
                  ) : (
                    "Tokenize Property"
                  )}
                </button>
              </div>
            </div>

            {/* Oracle Management */}
            <div className="space-y-6">
              {/* Submit Verified Rent */}
              <div className="bg-base-100 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="w-7 h-7" />
                Oracle: Verify Rent
              </h2>

              <div className="alert alert-warning mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">
                  <strong>Workflow:</strong> First verify rent here, then the manager can deposit the exact verified amount.
                </span>
              </div>                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Property ID</span>
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      className="input input-bordered"
                      value={rentPropertyId}
                      onChange={(e) => setRentPropertyId(e.target.value)}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Verified Rent Amount (ETH)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.5"
                      className="input input-bordered"
                      value={verifiedRent}
                      onChange={(e) => setVerifiedRent(e.target.value)}
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        In production, this would be verified by Chainlink oracles
                      </span>
                    </label>
                  </div>

                  <button
                    className="btn btn-secondary w-full"
                    onClick={handleSubmitVerifiedRent}
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Submit Verified Rent"}
                  </button>
                </div>
              </div>

              {/* Change Verifier */}
              <div className="bg-base-100 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Change Verifier</h2>

                <div className="space-y-4">
                  <div className="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div className="text-xs">
                      <div>Contract Owner (Admin):</div>
                      <div className="font-mono text-sm">{contractOwner}</div>
                    </div>
                  </div>

                  <p className="text-sm text-base-content/70">
                    As the contract owner, you can tokenize properties and verify rent payments.
                    The oracle role is built into the owner address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) => (
  <div className="bg-base-100 rounded-xl shadow-lg p-6">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <p className="text-sm text-base-content/60 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminPage;
