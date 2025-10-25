"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAuth } from "~~/hooks/useAuth";
import { RegisteredRoute } from "~~/components/ProtectedRoute";

const PropertyDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const { isAdmin, isRegistered } = useAuth();
  const propertyId = BigInt(params?.id as string || "1");

  // Tab state
  const [activeTab, setActiveTab] = useState<"buy" | "rent">("buy");
  
  // Form states
  const [sharesToBuy, setSharesToBuy] = useState("");
  const [rentAmount, setRentAmount] = useState("");

  // Read property data
  const { data: property, refetch: refetchProperty } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getProperty",
    args: [propertyId],
  });

  // Read user's shares
  const { data: userShares, refetch: refetchUserShares } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getSharesBalance",
    args: [propertyId, connectedAddress],
  });

  // Read contract owner
  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "owner",
  });

  // Write functions
  const { writeContractAsync: buyShares, isMining: isBuying } = useScaffoldWriteContract({
    contractName: "PropShare",
  });
  
  const { writeContractAsync: depositRent, isMining: isDepositing } = useScaffoldWriteContract({
    contractName: "PropShare",
  });
  
  const { writeContractAsync: withdrawYield, isMining: isWithdrawing } = useScaffoldWriteContract({
    contractName: "PropShare",
  });
  
  const { writeContractAsync: submitVerifiedRent, isMining: isVerifying } = useScaffoldWriteContract({
    contractName: "PropShare",
  });

  // Calculations
  const calculateTotalCost = () => {
    if (!sharesToBuy || !property) return "0.00";
    try {
      const shares = BigInt(sharesToBuy);
      const cost = shares * property.pricePerShare;
      return formatEther(cost);
    } catch {
      return "0.00";
    }
  };

  const calculateClaimableYield = () => {
    if (!property || !userShares || userShares === 0n || property.totalShares === 0n) {
      return "0.00";
    }
    const claimable = (userShares * property.rentBalance) / property.totalShares;
    return formatEther(BigInt(claimable));
  };

  const availableShares = property ? property.totalShares - property.sharesSold : 0n;
  const fundingPercentage = property && property.totalShares > 0n
    ? Number((property.sharesSold * 100n) / property.totalShares)
    : 0;

  // Handlers
  const handleBuyShares = async () => {
    if (!sharesToBuy || Number(sharesToBuy) <= 0) {
      alert("Please enter a valid number of shares");
      return;
    }
    
    try {
      const shares = BigInt(sharesToBuy);
      const cost = shares * (property?.pricePerShare || 0n);
      
      await buyShares({
        functionName: "buyShares",
        args: [propertyId, shares],
        value: cost,
      });
      
      alert("Shares purchased successfully!");
      setSharesToBuy("");
      refetchProperty();
      refetchUserShares();
    } catch (error) {
      console.error("Error buying shares:", error);
      alert("Failed to buy shares. Check console for details.");
    }
  };

  const handleSubmitVerifiedRent = async () => {
    if (!rentAmount || Number(rentAmount) <= 0) {
      alert("Please enter a valid rent amount");
      return;
    }
    
    try {
      const amount = parseEther(rentAmount);
      
      await submitVerifiedRent({
        functionName: "submitVerifiedRent",
        args: [propertyId, amount],
      });
      
      alert("Rent verified successfully! Manager can now deposit.");
      refetchProperty();
    } catch (error) {
      console.error("Error verifying rent:", error);
      alert("Failed to verify rent. Check console for details.");
    }
  };

  const handleDepositRent = async () => {
    if (!rentAmount || Number(rentAmount) <= 0) {
      alert("Please enter a valid rent amount");
      return;
    }
    
    try {
      const amount = parseEther(rentAmount);
      
      await depositRent({
        functionName: "depositRent",
        args: [propertyId],
        value: amount,
      });
      
      alert("Rent deposited successfully!");
      setRentAmount("");
      refetchProperty();
    } catch (error) {
      console.error("Error depositing rent:", error);
      alert("Failed to deposit rent. Make sure the amount matches the verified amount.");
    }
  };

  const handleWithdrawYield = async () => {
    try {
      await withdrawYield({
        functionName: "withdrawYield",
        args: [propertyId],
      });
      
      alert("Yield withdrawn successfully!");
      refetchProperty();
      refetchUserShares();
    } catch (error) {
      console.error("Error withdrawing yield:", error);
      alert("Failed to withdraw yield. Check console for details.");
    }
  };

  // Loading state
  if (!property || property.id === 0n) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading property...</p>
        </div>
      </div>
    );
  }

  const isManager = connectedAddress && property.manager.toLowerCase() === connectedAddress.toLowerCase();

  return (
    <RegisteredRoute>
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link href="/" className="btn btn-ghost gap-2 mb-6">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Marketplace
          </Link>

          {/* Property Header */}
          <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="relative h-80">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=400&fit=crop"
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`badge ${property.isFunded ? 'badge-success' : 'badge-primary'} badge-lg`}>
                  {property.isFunded ? 'Fully Funded' : 'Available'}
                </span>
              </div>
            </div>

            <div className="p-8">
              <h1 className="text-4xl font-bold mb-4">{property.name || `Property #${propertyId}`}</h1>
              <p className="text-base-content/60 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Mumbai, Maharashtra, India
              </p>

              {/* Funding Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Funding Progress</span>
                  <span className="font-semibold">{fundingPercentage}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full h-3" 
                  value={fundingPercentage} 
                  max="100"
                ></progress>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox
                  icon={<BuildingOfficeIcon className="w-6 h-6" />}
                  label="Price per Share"
                  value={`${formatEther(property.pricePerShare)} ETH`}
                />
                <StatBox
                  icon={<ChartBarIcon className="w-6 h-6" />}
                  label="Available Shares"
                  value={`${availableShares.toString()} / ${property.totalShares.toString()}`}
                />
                <StatBox
                  icon={<BanknotesIcon className="w-6 h-6" />}
                  label="Rent Balance"
                  value={`${formatEther(property.rentBalance)} ETH`}
                />
                <StatBox
                  icon={<UserGroupIcon className="w-6 h-6" />}
                  label="Your Shares"
                  value={userShares?.toString() || "0"}
                />
              </div>

              {/* Manager Address */}
              <div className="mt-6 p-4 bg-base-200 rounded-lg">
                <p className="text-sm font-semibold mb-2">Property Manager</p>
                <Address address={property.manager} />
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-base-100 rounded-xl shadow-lg p-6">
                <div className="tabs tabs-boxed mb-6">
                  <button
                    className={`tab ${activeTab === "buy" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("buy")}
                  >
                    Buy Shares
                  </button>
                  <button
                    className={`tab ${activeTab === "rent" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("rent")}
                  >
                    Rent & Yield
                  </button>
                </div>

                {/* Buy Shares Tab */}
                {activeTab === "buy" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Purchase Shares</h3>
                    
                    {!property.isFunded ? (
                      <>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Number of Shares</span>
                            <span className="label-text-alt">Max: {availableShares.toString()}</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Enter amount"
                              className="input input-bordered flex-1"
                              value={sharesToBuy}
                              onChange={(e) => setSharesToBuy(e.target.value)}
                              min="1"
                              max={availableShares.toString()}
                            />
                            <button
                              className="btn btn-outline"
                              onClick={() => setSharesToBuy(availableShares.toString())}
                            >
                              Max
                            </button>
                          </div>
                        </div>

                        <div className="bg-base-200 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Cost</span>
                            <span className="text-2xl font-bold text-primary">
                              {calculateTotalCost()} ETH
                            </span>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary w-full btn-lg"
                          onClick={handleBuyShares}
                          disabled={!isRegistered || isBuying || !sharesToBuy || Number(sharesToBuy) <= 0}
                        >
                          {isBuying ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Processing...
                            </>
                          ) : (
                            "Buy Shares"
                          )}
                        </button>

                        {!isRegistered && (
                          <div className="alert alert-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Please register to buy shares</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>This property is fully funded. Check secondary markets for trading opportunities.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Rent & Yield Tab */}
                {activeTab === "rent" && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Rent Management & Yield</h3>

                    {/* Oracle Verification (Admin Only) */}
                    {isAdmin && (
                      <div className="card bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <div className="card-body">
                          <h4 className="card-title text-blue-700 dark:text-blue-300">Oracle: Verify Rent</h4>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Submit verified rent amount (simulates oracle verification)
                          </p>
                          <div className="form-control mt-4">
                            <label className="label">
                              <span className="label-text font-semibold">Rent Amount (ETH)</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.5"
                              className="input input-bordered"
                              value={rentAmount}
                              onChange={(e) => setRentAmount(e.target.value)}
                            />
                          </div>
                          <button
                            className="btn btn-primary mt-4"
                            onClick={handleSubmitVerifiedRent}
                            disabled={isVerifying || !rentAmount}
                          >
                            {isVerifying ? "Verifying..." : "Submit Verified Rent"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Deposit Rent (Manager Only) */}
                    {isManager && (
                      <div className="card bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                        <div className="card-body">
                          <h4 className="card-title text-purple-700 dark:text-purple-300">Manager: Deposit Rent</h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Deposit verified rent for distribution to shareholders
                          </p>
                          <div className="form-control mt-4">
                            <label className="label">
                              <span className="label-text font-semibold">Rent Amount (ETH)</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.5"
                              className="input input-bordered"
                              value={rentAmount}
                              onChange={(e) => setRentAmount(e.target.value)}
                            />
                          </div>
                          <button
                            className="btn btn-secondary mt-4"
                            onClick={handleDepositRent}
                            disabled={isDepositing || !rentAmount}
                          >
                            {isDepositing ? "Depositing..." : "Deposit Rent"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Withdraw Yield (Shareholders) */}
                    {userShares && userShares > 0n && (
                      <div className="card bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                        <div className="card-body">
                          <h4 className="card-title text-green-700 dark:text-green-300">Your Claimable Yield</h4>
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400 my-4">
                            {calculateClaimableYield()} ETH
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Based on your {userShares.toString()} shares
                          </p>
                          <button
                            className="btn btn-success mt-4"
                            onClick={handleWithdrawYield}
                            disabled={isWithdrawing || property.rentBalance === 0n}
                          >
                            {isWithdrawing ? "Withdrawing..." : "Withdraw Yield"}
                          </button>
                        </div>
                      </div>
                    )}

                    {(!userShares || userShares === 0n) && !isManager && !isAdmin && (
                      <div className="alert">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>Buy shares to start earning yield from rent distributions</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Property Info */}
              <div className="bg-base-100 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Property Details</h3>
                <div className="space-y-3 text-sm">
                  <InfoRow label="Total Shares" value={property.totalShares.toString()} />
                  <InfoRow label="Shares Sold" value={property.sharesSold.toString()} />
                  <InfoRow label="Shares Available" value={availableShares.toString()} />
                  <InfoRow label="Funds Raised" value={`${formatEther(property.fundsRaised)} ETH`} />
                  <InfoRow label="Status" value={property.isFunded ? "Fully Funded" : "Raising Capital"} />
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-base-100 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/portfolio" className="btn btn-outline w-full">
                    My Portfolio
                  </Link>
                  <Link href="/governance" className="btn btn-outline w-full">
                    Governance
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="btn btn-outline w-full">
                      Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RegisteredRoute>
  );
};

// Helper Components
const StatBox = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-base-200 p-4 rounded-lg">
    <div className="flex items-center gap-2 text-primary mb-2">
      {icon}
    </div>
    <p className="text-xs text-base-content/60 mb-1">{label}</p>
    <p className="font-bold">{value}</p>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-base-content/60">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default PropertyDetailsPage;
