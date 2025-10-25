"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAuth } from "~~/hooks/useAuth";
import { RegistrationModal } from "~~/components/RegistrationModal";
import { AdminDebug } from "~~/components/AdminDebug";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { isRegistered } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "funded">("all");
  const [showRegistration, setShowRegistration] = useState(false);

  // Read property count
  const { data: propertyCount } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "propertyCount",
  });

  // Read property 1 for demo
  const { data: property1 } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "getProperty",
    args: [1n],
  });

  // Calculate available shares
  const getAvailableShares = (prop: any) => {
    if (!prop) return 0n;
    return BigInt(prop.totalShares || 0) - BigInt(prop.sharesSold || 0);
  };

  // Calculate funding percentage
  const getFundingPercentage = (prop: any) => {
    if (!prop || prop.totalShares === 0n) return 0;
    return Number((prop.sharesSold * 100n) / prop.totalShares);
  };

  // Check if user tries to invest without registration
  useEffect(() => {
    if (connectedAddress && !isRegistered) {
      setShowRegistration(true);
    }
  }, [connectedAddress, isRegistered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Invest in Real Estate, Starting from $200
            </h1>
            <p className="text-xl text-base-content/70 mb-8">
              Own fractional shares of real estate properties. Earn passive income from rent distribution.
              Participate in governance decisions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="#properties" className="btn btn-primary btn-lg">
                Browse Properties
              </Link>
              {connectedAddress && !isRegistered && (
                <button
                  onClick={() => setShowRegistration(true)}
                  className="btn btn-outline btn-lg"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <StatCard
              icon={<BuildingOfficeIcon className="w-8 h-8" />}
              value={propertyCount ? propertyCount.toString() : "0"}
              label="Properties Listed"
            />
            <StatCard
              icon={<UserGroupIcon className="w-8 h-8" />}
              value="250+"
              label="Active Investors"
            />
            <StatCard
              icon={<ChartBarIcon className="w-8 h-8" />}
              value="$2.5M"
              label="Total Value Locked"
            />
            <StatCard
              icon={<ShieldCheckIcon className="w-8 h-8" />}
              value="$45K"
              label="Rent Distributed"
            />
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="properties" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold">Available Properties</h2>
            
            {/* Search and Filter */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="input input-bordered w-full md:w-64 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  suppressHydrationWarning
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-base-content/40" />
              </div>
              
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-outline gap-2" suppressHydrationWarning>
                  <FunnelIcon className="w-5 h-5" />
                  Filter
                </button>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                  <li>
                    <button onClick={() => setFilterStatus("all")}>All Properties</button>
                  </li>
                  <li>
                    <button onClick={() => setFilterStatus("available")}>Available</button>
                  </li>
                  <li>
                    <button onClick={() => setFilterStatus("funded")}>Fully Funded</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {property1 && property1.id !== 0n ? (
              <PropertyCard
                property={{
                  id: Number(property1.id),
                  name: property1.name || "Luxury Property",
                  location: "Premium Location",
                  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
                  totalShares: property1.totalShares,
                  sharesSold: property1.sharesSold,
                  pricePerShare: property1.pricePerShare,
                  rentBalance: property1.rentBalance,
                  isFunded: property1.isFunded,
                }}
                fundingPercentage={getFundingPercentage(property1)}
                availableShares={getAvailableShares(property1)}
              />
            ) : (
              <div className="col-span-full text-center py-16">
                <BuildingOfficeIcon className="w-20 h-20 mx-auto text-base-content/20 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-base-content/60">No Properties Yet</h3>
                <p className="text-base-content/50">
                  Properties will appear here once they're tokenized by the admin
                </p>
                <p className="text-sm text-info mt-4">
                  Connect with deployer wallet (0xf39Fd...92266) to access Admin Panel
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-base-200/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Connect Wallet"
              description="Connect your Web3 wallet and complete quick registration"
            />
            <StepCard
              number="2"
              title="Browse Properties"
              description="Explore verified real estate properties and view detailed information"
            />
            <StepCard
              number="3"
              title="Buy Shares"
              description="Purchase fractional ownership starting from just 0.1 ETH"
            />
            <StepCard
              number="4"
              title="Earn Yield"
              description="Receive proportional rent payments and participate in governance"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why PropShare?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Oracle-Verified Rent"
              description="All rent deposits are verified by oracles, ensuring managers can't underreport rent collected."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              title="Escrow Protection"
              description="Your investment is held in escrow until property reaches 100% funding, protecting against exit scams."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              title="Governance Rights"
              description="Vote on property decisions with share-weighted voting power. Your shares, your voice."
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistration && (
        <RegistrationModal
          isOpen={showRegistration}
          onClose={() => setShowRegistration(false)}
          onSuccess={() => {
            setShowRegistration(false);
            window.location.reload();
          }}
        />
      )}

      {/* Admin Debug Panel - Shows admin status */}
      <AdminDebug />
    </div>
  );
};

// ============= Component Definitions =============

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatCard = ({ icon, value, label }: StatCardProps) => (
  <div className="bg-base-100 p-6 rounded-xl border border-base-300 shadow-sm">
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

interface PropertyCardProps {
  property: {
    id: number;
    name: string;
    location: string;
    image: string;
    totalShares: bigint;
    sharesSold: bigint;
    pricePerShare: bigint;
    rentBalance: bigint;
    isFunded: boolean;
  };
  fundingPercentage: number;
  availableShares: bigint;
}

const PropertyCard = ({ property, fundingPercentage, availableShares }: PropertyCardProps) => (
  <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
    <figure className="relative h-48 overflow-hidden">
      <img 
        src={property.image}
        alt={property.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 right-3">
        <span className={`badge ${property.isFunded ? 'badge-success' : 'badge-primary'} badge-lg`}>
          {property.isFunded ? 'Fully Funded' : 'Available'}
        </span>
      </div>
    </figure>
    
    <div className="card-body">
      <h3 className="card-title">{property.name}</h3>
      <p className="text-sm text-base-content/60 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {property.location}
      </p>
      
      {/* Funding Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Funding Progress</span>
          <span className="font-semibold">{fundingPercentage}%</span>
        </div>
        <progress 
          className="progress progress-primary w-full" 
          value={fundingPercentage} 
          max="100"
        ></progress>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <p className="text-base-content/60">Price per Share</p>
          <p className="font-semibold">{formatEther(property.pricePerShare)} ETH</p>
        </div>
        <div>
          <p className="text-base-content/60">Available</p>
          <p className="font-semibold">{availableShares.toString()} shares</p>
        </div>
        <div>
          <p className="text-base-content/60">Total Shares</p>
          <p className="font-semibold">{property.totalShares.toString()}</p>
        </div>
        <div>
          <p className="text-base-content/60">Rent Balance</p>
          <p className="font-semibold">{formatEther(property.rentBalance)} ETH</p>
        </div>
      </div>

      <div className="card-actions mt-6">
        <Link href={`/property/${property.id}`} className="btn btn-primary w-full">
          View Details
        </Link>
      </div>
    </div>
  </div>
);

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => (
  <div className="relative">
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-base-content/70">{description}</p>
    </div>
  </div>
);

interface FeatureCardProps {
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard = ({ title, description, gradient }: FeatureCardProps) => (
  <div className="card bg-base-100 border border-base-300 shadow-lg hover:shadow-xl transition-all">
    <div className="card-body">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} mb-4`}></div>
      <h3 className="card-title">{title}</h3>
      <p className="text-base-content/70">{description}</p>
    </div>
  </div>
);

export default Home;
