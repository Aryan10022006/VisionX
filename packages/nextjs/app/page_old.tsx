"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther, formatEther } from "viem";
import { useAccount } from "wagmi";
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  BanknotesIcon, 
  UserPlusIcon, 
  ChartBarIcon,
  Cog6ToothIcon 
} from "@heroicons/react/24/outline";
import { Address, AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract, useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: deployedContractData } = useDeployedContractInfo("PropShare");

  // Active tab state
  const [activeTab, setActiveTab] = useState<"buy" | "yield">("buy");

  // Form states
  const [sharesToBuy, setSharesToBuy] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  
  // Admin form states
  const [propertyName, setPropertyName] = useState("");
  const [propertyURI, setPropertyURI] = useState("");
  const [totalShares, setTotalShares] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [managerAddress, setManagerAddress] = useState("");

  // Governance state
  const [proposalDescription, setProposalDescription] = useState("");

  // Read property data (Property ID 1)
  const { data: property, refetch: refetchProperty } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getProperty",
    args: [1n],
  });

  // Read user's shares
  const { data: userShares, refetch: refetchUserShares } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getSharesBalance",
    args: [1n, connectedAddress],
  });

  // Calculate claimable yield
  const calculateClaimableYield = () => {
    if (!property || !userShares || userShares === 0n || property.totalShares === 0n) {
      return "0.00";
    }
    const claimable = (userShares * property.rentBalance) / property.totalShares;
    return formatEther(claimable);
  };

  // Calculate total cost for buying shares
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
  const { writeContractAsync: tokenizeProperty, isMining: isTokenizing } = useScaffoldWriteContract({
    contractName: "PropShare",
  });
  const { writeContractAsync: createProposal, isMining: isCreatingProposal } = useScaffoldWriteContract({
    contractName: "PropShare",
  });

  // Handlers
    const handleBuyShares = async () => {
    if (!sharesToBuy || Number(sharesToBuy) <= 0) return;
    try {
      const pricePerShare = property?.pricePerShare || 0n;
      const totalCost = BigInt(sharesToBuy) * pricePerShare;
      
      await buyShares({
        functionName: "buyShares",
        args: [1n, BigInt(sharesToBuy)],
        value: totalCost,
      });
      setTimeout(() => refetchProperty(), 2000);
      setSharesToBuy("");
    } catch (error) {
      console.error("Error buying shares:", error);
    }
  };

  const handleDepositRent = async () => {
    if (!rentAmount || Number(rentAmount) <= 0) return;
    try {
      await depositRent({
        functionName: "depositRent",
        args: [1n],
        value: parseEther(rentAmount),
      });
      setTimeout(() => refetchProperty(), 2000);
      setRentAmount("");
    } catch (error) {
      console.error("Error depositing rent:", error);
    }
  };

    const handleWithdrawYield = async () => {
    try {
      await withdrawYield({
        functionName: "withdrawYield",
        args: [1n],
      });
      setTimeout(() => {
        refetchProperty();
        refetchUserShares();
      }, 2000);
    } catch (error) {
      console.error("Error withdrawing yield:", error);
    }
  };

    const handleTokenizeProperty = async () => {
    if (!propertyName || !propertyURI || !totalShares || !pricePerShare || !managerAddress) return;
    try {
      await tokenizeProperty({
        functionName: "tokenizeProperty",
        args: [propertyName, propertyURI, BigInt(totalShares), parseEther(pricePerShare), managerAddress],
      });
      setTimeout(() => refetchProperty(), 2000);
      // Clear form
      setPropertyName("");
      setPropertyURI("");
      setTotalShares("");
      setPricePerShare("");
      setManagerAddress("");
    } catch (error) {
      console.error("Error tokenizing property:", error);
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalDescription) return;
    try {
      await createProposal({
        functionName: "createProposal",
        args: [1n, proposalDescription],
      });
      
      setProposalDescription("");
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 flex items-center justify-center gap-3">
            <HomeIcon className="w-12 h-12" />
            PropShare
          </h1>
          <p className="text-xl md:text-2xl mb-6 font-light">
            Invest in real estate, one share at a time. Decentralized, transparent, and accessible to all.
          </p>
          {deployedContractData && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="opacity-80">Contract:</span>
              <Address address={deployedContractData.address} />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Property Display - Two Column Layout */}
        {property && property.id !== 0n ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Property Image */}
              <div className="relative h-64 md:h-auto">
                <img 
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop" 
                  alt="Property"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Property #{property.id.toString()}
                </div>
              </div>

              {/* Property Data */}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{property.name}</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Shares Sold</span>
                    <span className="text-xl font-bold text-gray-900">
                      {property.sharesSold.toString()} / {property.totalShares.toString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Price per Share</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatEther(property.pricePerShare)} ETH
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Total Rent Pool</span>
                    <span className="text-2xl font-bold text-green-600 flex items-center gap-2">
                      <BanknotesIcon className="w-6 h-6" />
                      {formatEther(property.rentBalance)} ETH
                    </span>
                  </div>
                </div>

                {/* Personal Stats */}
                {connectedAddress && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ChartBarIcon className="w-5 h-5" />
                      Your Stake
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">My Shares</span>
                        <span className="text-lg font-bold text-gray-900">
                          {userShares?.toString() || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">My Claimable Yield</span>
                        <span className="text-xl font-bold text-green-600">
                          {calculateClaimableYield()} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center mb-12">
            <p className="text-lg text-yellow-800">
              No property found. Please create a property using the Admin Panel below.
            </p>
          </div>
        )}

        {/* Main Action Panel - Tabbed Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("buy")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "buy"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <UserPlusIcon className="w-5 h-5" />
              Buy Shares
            </button>
            <button
              onClick={() => setActiveTab("yield")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "yield"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BanknotesIcon className="w-5 h-5" />
              Rent & Yield
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Tab 1: Buy Shares */}
            {activeTab === "buy" && (
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Purchase Property Shares</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Enter the number of shares you want to buy
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Shares
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 50"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={sharesToBuy}
                      onChange={(e) => setSharesToBuy(e.target.value)}
                      min="1"
                    />
                  </div>

                  {sharesToBuy && property && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total Cost:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {calculateTotalCost()} ETH
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBuyShares}
                    disabled={!sharesToBuy || isBuying || !property}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isBuying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CurrencyDollarIcon className="w-5 h-5" />
                        Buy Shares
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Rent & Yield */}
            {activeTab === "yield" && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* For Tenants - Deposit Rent */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For Tenants</h3>
                  <p className="text-gray-600 mb-4 text-sm">Deposit monthly rent into the property pool</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rent Amount (ETH)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1.0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={rentAmount}
                        onChange={(e) => setRentAmount(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleDepositRent}
                      disabled={!rentAmount || isDepositing}
                      className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isDepositing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Depositing...
                        </>
                      ) : (
                        <>
                          <BanknotesIcon className="w-5 h-5" />
                          Deposit Rent
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* For Investors - Withdraw Yield */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">For Investors</h3>
                  <p className="text-gray-600 mb-4 text-sm">Claim your share of the rent pool</p>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 mb-4 border border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Your Claimable Yield</p>
                      <p className="text-4xl font-bold text-green-600">
                        {calculateClaimableYield()} ETH
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleWithdrawYield}
                    disabled={!userShares || userShares === 0n || isWithdrawing}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2"
                  >
                    {isWithdrawing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        💰 Withdraw My Yield
                      </>
                    )}
                  </button>

                  {(!userShares || userShares === 0n) && (
                    <p className="text-sm text-gray-500 text-center mt-3">
                      You must own shares to withdraw yield
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-6">
          {/* Governance Panel */}
          <details className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <summary className="cursor-pointer bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 font-semibold text-gray-900 hover:bg-purple-100 transition-colors flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Governance (For Shareholders)
            </summary>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                Create proposals for property decisions. Voting is handled via the Debug Contracts page.
              </p>
              
              <div className="max-w-xl space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposal Description
                  </label>
                  <textarea
                    placeholder="e.g., Install solar panels on the roof"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24"
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                  ></textarea>
                </div>

                <button
                  onClick={handleCreateProposal}
                  disabled={!proposalDescription || isCreatingProposal || !userShares || userShares === 0n}
                  className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isCreatingProposal ? "Creating..." : "Create Proposal"}
                </button>

                {(!userShares || userShares === 0n) && (
                  <p className="text-sm text-orange-600">
                    You must own shares to create proposals
                  </p>
                )}
              </div>
            </div>
          </details>

          {/* Admin Panel */}
          <details className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden">
            <summary className="cursor-pointer bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 font-semibold text-gray-900 hover:bg-red-100 transition-colors flex items-center gap-2">
              <Cog6ToothIcon className="w-5 h-5" />
              Admin Panel (Owner Only)
            </summary>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-sm">
                Create a new property for tokenization. Only the contract owner can perform this action.
              </p>
              
              <div className="max-w-2xl space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Name
                    </label>
                    <input
                      type="text"
                      placeholder="1BHK Mumbai Apartment"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property URI
                    </label>
                    <input
                      type="text"
                      placeholder="ipfs://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={propertyURI}
                      onChange={(e) => setPropertyURI(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Shares
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={totalShares}
                      onChange={(e) => setTotalShares(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Share (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={pricePerShare}
                      onChange={(e) => setPricePerShare(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Address
                  </label>
                  <AddressInput
                    value={managerAddress}
                    onChange={setManagerAddress}
                    placeholder="0x..."
                  />
                </div>

                <button
                  onClick={handleTokenizeProperty}
                  disabled={!propertyName || !totalShares || !pricePerShare || !managerAddress || isTokenizing}
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isTokenizing ? "Creating Property..." : "Create New Property"}
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Built with ❤️ for the Web3 Impact Hackathon | Powered by Scaffold-ETH 2
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
