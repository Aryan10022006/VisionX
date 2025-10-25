"use client";

import { useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  BuildingOfficeIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { RegisteredRoute } from "~~/components/ProtectedRoute";

const PortfolioPage = () => {
  const { address: connectedAddress } = useAccount();

  // Read property 1 (in a real app, loop through all properties)
  const { data: property1 } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getProperty",
    args: [1n],
  });

  const { data: userShares1 } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getSharesBalance",
    args: [1n, connectedAddress],
  });

  // Calculate totals
  const calculateTotalInvestment = () => {
    if (!property1 || !userShares1 || userShares1 === 0n) return "0.00";
    const investment = userShares1 * property1.pricePerShare;
    return formatEther(BigInt(investment));
  };

  const calculateTotalYield = () => {
    if (!property1 || !userShares1 || userShares1 === 0n || property1.totalShares === 0n) {
      return "0.00";
    }
    const yield_ = (userShares1 * property1.rentBalance) / property1.totalShares;
    return formatEther(BigInt(yield_));
  };

  const hasProperties = userShares1 && userShares1 > 0n;

  return (
    <RegisteredRoute>
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Portfolio</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <SummaryCard
              icon={<BuildingOfficeIcon className="w-8 h-8" />}
              label="Properties Owned"
              value={hasProperties ? "1" : "0"}
              gradient="from-blue-500 to-cyan-500"
            />
            <SummaryCard
              icon={<BanknotesIcon className="w-8 h-8" />}
              label="Total Investment"
              value={`${calculateTotalInvestment()} ETH`}
              gradient="from-purple-500 to-pink-500"
            />
            <SummaryCard
              icon={<ChartBarIcon className="w-8 h-8" />}
              label="Claimable Yield"
              value={`${calculateTotalYield()} ETH`}
              gradient="from-orange-500 to-red-500"
            />
            <SummaryCard
              icon={<ArrowTrendingUpIcon className="w-8 h-8" />}
              label="Estimated APY"
              value="8.5%"
              gradient="from-green-500 to-emerald-500"
            />
          </div>

          {/* Properties Grid */}
          <div className="bg-base-100 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Your Properties</h2>
            
            {hasProperties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Property Card */}
                <div className="card bg-base-200 shadow-xl">
                  <figure className="h-48">
                    <img
                      src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop"
                      alt={property1?.name || "Property"}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title">{property1?.name || "Property #1"}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Your Shares</span>
                        <span className="font-semibold">{userShares1?.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Ownership</span>
                        <span className="font-semibold">
                          {property1 && property1.totalShares > 0n
                            ? ((Number(userShares1) / Number(property1.totalShares)) * 100).toFixed(2)
                            : "0"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Investment</span>
                        <span className="font-semibold">
                          {calculateTotalInvestment()} ETH
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/60">Claimable Yield</span>
                        <span className="font-semibold text-success">
                          {calculateTotalYield()} ETH
                        </span>
                      </div>
                    </div>
                    <div className="card-actions mt-4">
                      <Link href="/property/1" className="btn btn-primary btn-sm w-full">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <BuildingOfficeIcon className="w-20 h-20 mx-auto text-base-content/20 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-base-content/60">No Properties Yet</h3>
                <p className="text-base-content/50 mb-6">
                  Start investing in real estate to see your portfolio here
                </p>
                <Link href="/" className="btn btn-primary">
                  Browse Properties
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </RegisteredRoute>
  );
};

const SummaryCard = ({
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

export default PortfolioPage;
