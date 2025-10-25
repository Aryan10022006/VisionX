"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";

/**
 * Admin Override Component
 * Allows manually entering a wallet address to view admin UI
 * Perfect for hackathon demos and judging
 */
export const AdminOverride = () => {
  const { address: connectedAddress } = useAccount();
  const [adminInput, setAdminInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentOverride, setCurrentOverride] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration by only rendering on client
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setCurrentOverride(localStorage.getItem("propshare_admin_override"));
    }
  }, []);

  const handleSetAdminView = () => {
    if (!adminInput || !isAddress(adminInput)) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    // Save to localStorage
    localStorage.setItem("propshare_admin_override", adminInput.toLowerCase());
    
    // Reload page to apply changes
    window.location.reload();
  };

  const handleClearAdminView = () => {
    localStorage.removeItem("propshare_admin_override");
    window.location.reload();
  };

  // Don't render until mounted on client
  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="btn btn-circle btn-sm btn-primary shadow-lg"
          title="Admin Demo Mode"
        >
          🔑
        </button>
      ) : (
        <div className="bg-base-100 rounded-lg shadow-2xl p-4 w-80 border border-base-300">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm">Admin Demo Mode</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="btn btn-ghost btn-xs btn-circle"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-base-content/60 mb-3">
            Enter any wallet address to view admin UI for demo purposes.
          </div>

          {currentOverride && (
            <div className="alert alert-info mb-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-xs">
                <div className="font-semibold">Viewing as:</div>
                <div className="font-mono">{currentOverride.slice(0, 6)}...{currentOverride.slice(-4)}</div>
              </div>
            </div>
          )}

          <div className="form-control mb-3">
            <label className="label py-1">
              <span className="label-text text-xs">Wallet Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered input-sm"
              value={adminInput}
              onChange={(e) => setAdminInput(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSetAdminView}
              className="btn btn-primary btn-sm flex-1"
              disabled={!adminInput}
            >
              View as Admin
            </button>
            {currentOverride && (
              <button
                onClick={handleClearAdminView}
                className="btn btn-ghost btn-sm"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-base-content/50 mt-3 border-t border-base-300 pt-2">
            ⚠️ Note: This only shows admin UI. Actual transactions still require connecting the real admin wallet.
          </div>
        </div>
      )}
    </div>
  );
};
