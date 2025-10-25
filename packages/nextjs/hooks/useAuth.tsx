"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/**
 * User profile stored in localStorage
 * In production, this would be on-chain or in a database with proper KYC
 */
export interface UserProfile {
  address: string;
  name: string;
  email: string;
  registeredAt: number;
  isVerified: boolean;
}

/**
 * Authentication and user management hook
 * Provides wallet-based authentication with user profiles
 */
export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get contract owner (admin)
  const { data: contractOwner } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "owner",
  });

  // Load user profile from localStorage
  useEffect(() => {
    if (!address) {
      setUserProfile(null);
      setIsRegistered(false);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Check for admin override (for demo purposes)
    const adminOverride = typeof window !== "undefined" 
      ? localStorage.getItem("propshare_admin_override") 
      : null;

    // Check if user is admin - REAL contract owner takes priority
    const isRealAdmin = contractOwner && address.toLowerCase() === contractOwner.toLowerCase();
    const isDemoAdmin = adminOverride && address.toLowerCase() === adminOverride.toLowerCase();
    
    if (isRealAdmin || isDemoAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    // Check simple registration flag first (fastest)
    const isRegisteredFlag = typeof window !== "undefined"
      ? localStorage.getItem(`propshare_registered_${address.toLowerCase()}`)
      : null;

    // Load profile
    const profiles = getUserProfiles();
    const profile = profiles[address.toLowerCase()];
    
    if (profile || isRegisteredFlag) {
      setUserProfile(profile);
      setIsRegistered(true);
    } else {
      setUserProfile(null);
      setIsRegistered(false);
    }
    
    setIsLoading(false);
  }, [address, contractOwner]);

  return {
    address,
    isConnected,
    userProfile,
    isRegistered,
    isAdmin,
    isLoading,
    register: registerUser,
    updateProfile: updateUserProfile,
    logout: logoutUser,
  };
};

// ============= Helper Functions =============

/**
 * Get all user profiles from localStorage
 */
function getUserProfiles(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem("propshare_users");
  return data ? JSON.parse(data) : {};
}

/**
 * Save user profiles to localStorage
 */
function saveUserProfiles(profiles: Record<string, UserProfile>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("propshare_users", JSON.stringify(profiles));
}

/**
 * Register a new user
 */
export function registerUser(address: string, name: string, email: string): UserProfile {
  const profiles = getUserProfiles();
  
  const newProfile: UserProfile = {
    address: address.toLowerCase(),
    name,
    email,
    registeredAt: Date.now(),
    isVerified: false, // In production, require KYC verification
  };
  
  profiles[address.toLowerCase()] = newProfile;
  saveUserProfiles(profiles);
  
  return newProfile;
}

/**
 * Update user profile
 */
export function updateUserProfile(address: string, updates: Partial<UserProfile>) {
  const profiles = getUserProfiles();
  const profile = profiles[address.toLowerCase()];
  
  if (!profile) {
    throw new Error("User not registered");
  }
  
  profiles[address.toLowerCase()] = {
    ...profile,
    ...updates,
  };
  
  saveUserProfiles(profiles);
  return profiles[address.toLowerCase()];
}

/**
 * Logout user (disconnect wallet)
 */
export function logoutUser() {
  // Wallet disconnection is handled by wagmi/RainbowKit
  // This is just a placeholder for future logout logic
  console.log("User logged out");
}

/**
 * Check if address is registered
 */
export function isAddressRegistered(address: string): boolean {
  const profiles = getUserProfiles();
  return !!profiles[address.toLowerCase()];
}

/**
 * Get user profile by address
 */
export function getUserProfile(address: string): UserProfile | null {
  const profiles = getUserProfiles();
  return profiles[address.toLowerCase()] || null;
}
