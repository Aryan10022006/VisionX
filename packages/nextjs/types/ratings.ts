/**
 * Rating and reputation system types
 */

export interface PropertyRating {
  propertyId: number;
  averageRating: number; // 0-5 stars
  totalReviews: number;
  ratingBreakdown: {
    roi: number; // Return on Investment score
    maintenance: number; // Property maintenance quality
    location: number; // Location desirability
    management: number; // Manager performance
    transparency: number; // Reporting transparency
  };
  reviews: Review[];
}

export interface Review {
  reviewer: string; // Wallet address
  rating: number; // 1-5 stars
  comment: string;
  timestamp: number;
  verified: boolean; // Only shareholders can review
}

export interface ManagerReputation {
  managerAddress: string;
  overallRating: number; // 0-5 stars
  totalProperties: number;
  metrics: {
    rentPaymentConsistency: number; // On-time payment rate %
    responseTime: number; // Avg hours to respond
    maintenanceQuality: number; // Rating from tenants
    transparencyScore: number; // Reporting completeness
    governanceParticipation: number; // Response to proposals
  };
  badges: ManagerBadge[];
}

export interface ManagerBadge {
  id: string;
  name: string; // "Top Performer", "Reliable", "Transparent"
  icon: string;
  earnedAt: number;
  description: string;
}

export interface InvestorReputation {
  address: string;
  level: InvestorLevel;
  stats: {
    totalInvested: bigint;
    propertiesOwned: number;
    governanceParticipation: number; // Voting % (0-100)
    accountAge: number; // Days since first investment
    proposalsCreated: number;
    avgHoldingPeriod: number; // Days
  };
  badges: InvestorBadge[];
  trustScore: number; // 0-100
}

export type InvestorLevel = 
  | "Bronze" // < $10k invested
  | "Silver" // $10k - $50k
  | "Gold"   // $50k - $200k
  | "Platinum" // > $200k
  | "Diamond"; // > $1M + high governance participation

export interface InvestorBadge {
  id: string;
  name: string; // "Active Voter", "Early Adopter", "Long-term Holder"
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt: number;
}

export interface PlatformMetrics {
  adminTrustScore: number; // Overall platform reputation
  totalValueLocked: bigint;
  totalProperties: number;
  totalInvestors: number;
  avgPropertyRating: number;
  totalRentDistributed: bigint;
  platformUptime: number; // %
  securityScore: number; // Based on audits, incidents
}
