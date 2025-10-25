"use client";

import { useState, useEffect } from "react";

/**
 * Mock rating system - in production, fetch from database
 * This demonstrates the rating structure
 */

export const useRatings = () => {
  // Mock data - in production, fetch from API/database
  const getPropertyRating = (propertyId: number) => {
    // Simulate property ratings
    return {
      propertyId,
      averageRating: 4.5,
      totalReviews: 23,
      ratingBreakdown: {
        roi: 4.7, // Great returns
        maintenance: 4.3, // Good upkeep
        location: 4.8, // Excellent location
        management: 4.2, // Solid management
        transparency: 4.6, // Very transparent
      },
    };
  };

  const getManagerReputation = (managerAddress: string) => {
    return {
      managerAddress,
      overallRating: 4.4,
      totalProperties: 3,
      metrics: {
        rentPaymentConsistency: 98, // 98% on-time
        responseTime: 4.2, // 4.2 hours avg
        maintenanceQuality: 4.5,
        transparencyScore: 4.7,
        governanceParticipation: 92, // 92% response rate
      },
      badges: [
        {
          id: "reliable",
          name: "Reliable Manager",
          icon: "🏆",
          earnedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          description: "100% on-time rent payments for 6+ months",
        },
        {
          id: "transparent",
          name: "Transparency Champion",
          icon: "💎",
          earnedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
          description: "Detailed monthly reports submitted consistently",
        },
      ],
    };
  };

  const getInvestorReputation = (address: string) => {
    const stats = {
      totalInvested: BigInt(5000000000000000000), // 5 ETH
      propertiesOwned: 2,
      governanceParticipation: 85, // 85% voting rate
      accountAge: 120, // 120 days
      proposalsCreated: 3,
      avgHoldingPeriod: 90, // 90 days avg hold
    };

    // Calculate investor level based on investment amount
    let level: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" = "Bronze";
    const investedEth = Number(stats.totalInvested) / 1e18;
    
    if (investedEth >= 1000) level = "Diamond";
    else if (investedEth >= 200) level = "Platinum";
    else if (investedEth >= 50) level = "Gold";
    else if (investedEth >= 10) level = "Silver";

    // Calculate trust score (0-100)
    const trustScore = Math.min(
      100,
      (stats.governanceParticipation * 0.4) + // 40% weight on governance
      (Math.min(stats.accountAge / 365, 1) * 30) + // 30% weight on account age
      (Math.min(stats.avgHoldingPeriod / 180, 1) * 30) // 30% weight on holding period
    );

    return {
      address,
      level,
      stats,
      trustScore: Math.round(trustScore),
      badges: [
        {
          id: "active-voter",
          name: "Active Voter",
          icon: "🗳️",
          rarity: "rare" as const,
          earnedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        },
        {
          id: "early-adopter",
          name: "Early Adopter",
          icon: "🚀",
          rarity: "epic" as const,
          earnedAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
        },
      ],
    };
  };

  const getPlatformMetrics = () => {
    return {
      adminTrustScore: 94, // High platform trust
      totalValueLocked: BigInt(250000000000000000000), // 250 ETH
      totalProperties: 5,
      totalInvestors: 127,
      avgPropertyRating: 4.3,
      totalRentDistributed: BigInt(45000000000000000000), // 45 ETH
      platformUptime: 99.8, // 99.8% uptime
      securityScore: 92, // Based on audits
    };
  };

  return {
    getPropertyRating,
    getManagerReputation,
    getInvestorReputation,
    getPlatformMetrics,
  };
};

/**
 * Helper to get star display
 */
export const getStarDisplay = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "⭐".repeat(fullStars);
  if (hasHalfStar) stars += "⭐"; // In production, use half-star icon
  return stars;
};

/**
 * Helper to get level color
 */
export const getLevelColor = (level: string): string => {
  switch (level) {
    case "Diamond": return "text-cyan-400";
    case "Platinum": return "text-gray-300";
    case "Gold": return "text-yellow-400";
    case "Silver": return "text-gray-400";
    case "Bronze": return "text-orange-600";
    default: return "text-gray-500";
  }
};

/**
 * Helper to get level badge
 */
export const getLevelBadge = (level: string): string => {
  switch (level) {
    case "Diamond": return "💎";
    case "Platinum": return "🏆";
    case "Gold": return "🥇";
    case "Silver": return "🥈";
    case "Bronze": return "🥉";
    default: return "🌟";
  }
};
