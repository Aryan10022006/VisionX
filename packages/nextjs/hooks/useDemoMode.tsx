"use client";

import { useState, useEffect } from "react";

/**
 * Demo Mode Hook - Provides mock data for demo purposes
 * Use this when blockchain isn't available
 */
export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo mode is enabled
    const demoMode = localStorage.getItem("propshare_demo_mode");
    setIsDemoMode(demoMode === "true");
  }, []);

  const enableDemoMode = () => {
    localStorage.setItem("propshare_demo_mode", "true");
    setIsDemoMode(true);
    window.location.reload();
  };

  const disableDemoMode = () => {
    localStorage.removeItem("propshare_demo_mode");
    setIsDemoMode(false);
    window.location.reload();
  };

  // Mock property data for demo
  const mockProperties = [
    {
      id: 1,
      name: "Sunset Villa, Miami Beach",
      propertyURI: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      totalShares: 1000,
      sharesSold: 650,
      pricePerShare: "0.1",
      rentBalance: "10",
      manager: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      fundsRaised: "65",
      isFunded: false,
    },
    {
      id: 2,
      name: "Downtown Loft, Manhattan",
      propertyURI: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      totalShares: 500,
      sharesSold: 500,
      pricePerShare: "0.2",
      rentBalance: "15",
      manager: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      fundsRaised: "100",
      isFunded: true,
    },
    {
      id: 3,
      name: "Ocean View Condo, Malibu",
      propertyURI: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      totalShares: 2000,
      sharesSold: 1200,
      pricePerShare: "0.15",
      rentBalance: "25",
      manager: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      fundsRaised: "180",
      isFunded: false,
    },
  ];

  const mockStats = {
    totalProperties: 3,
    totalInvestors: 250,
    totalValueLocked: "2.5M",
    rentDistributed: "45K",
  };

  const mockUserShares = {
    1: 10,
    2: 25,
    3: 15,
  };

  return {
    isDemoMode,
    enableDemoMode,
    disableDemoMode,
    mockProperties,
    mockStats,
    mockUserShares,
  };
};
