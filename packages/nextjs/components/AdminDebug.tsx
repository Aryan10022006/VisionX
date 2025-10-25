"use client";

import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAuth } from "~~/hooks/useAuth";

/**
 * Admin Debug Panel - Shows why you are/aren't admin
 * Remove this after debugging
 */
export const AdminDebug = () => {
  const { address, isConnected } = useAccount();
  const { isAdmin, isLoading } = useAuth();
  
  const { data: contractOwner, isLoading: ownerLoading, error: ownerError } = useScaffoldReadContract({
    contractName: "PropShare",
    functionName: "owner",
  });

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-500 text-black p-4 rounded-lg shadow-xl max-w-md z-50">
        <h3 className="font-bold text-lg mb-2">🔍 Admin Debug</h3>
        <p className="text-sm">❌ Wallet not connected!</p>
        <p className="text-xs mt-2">Click "Connect Wallet" to continue</p>
      </div>
    );
  }

  const addressMatch = address && contractOwner && 
    address.toLowerCase() === contractOwner.toLowerCase();

  // Check for admin override
  const adminOverride = typeof window !== "undefined" 
    ? localStorage.getItem("propshare_admin_override") 
    : null;
  const isDemoAdmin = adminOverride && address?.toLowerCase() === adminOverride.toLowerCase();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md z-50 text-xs font-mono">
      <h3 className="font-bold text-sm mb-3 text-yellow-400">🔍 Admin Debug Panel</h3>
      
      <div className="space-y-2">
        <div>
          <p className="text-gray-400">Your Wallet Address:</p>
          <p className="text-green-400 break-all">{address || "Not connected"}</p>
        </div>

        <div>
          <p className="text-gray-400">Contract Owner (Admin):</p>
          {ownerError ? (
            <p className="text-red-400 text-xs">Error: {ownerError.message}</p>
          ) : ownerLoading ? (
            <p className="text-yellow-400">Loading...</p>
          ) : contractOwner ? (
            <p className="text-blue-400 break-all">{contractOwner}</p>
          ) : (
            <p className="text-red-400">Failed to load</p>
          )}
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
          <p className="text-gray-400">Addresses Match?</p>
          <p className={addressMatch ? "text-green-400" : "text-red-400"}>
            {addressMatch ? "✅ YES - You're Admin!" : "❌ NO - Different addresses"}
          </p>
        </div>

        {isDemoAdmin && (
          <div className="border-t border-gray-700 pt-2 mt-2">
            <p className="text-purple-400">🔑 Demo Admin Override Active</p>
            <p className="text-xs text-purple-300">Viewing as admin for demo</p>
          </div>
        )}

        <div>
          <p className="text-gray-400">Is Admin?</p>
          <p className={isAdmin ? "text-green-400" : "text-red-400"}>
            {isAdmin ? "✅ TRUE" : "❌ FALSE"}
          </p>
        </div>

        <div>
          <p className="text-gray-400">Loading?</p>
          <p>{isLoading ? "⏳ Yes" : "✅ No"}</p>
        </div>
      </div>

      {!addressMatch && contractOwner && address && (
        <div className="mt-3 p-2 bg-red-900/50 rounded border border-red-500">
          <p className="text-red-300 font-bold text-xs">⚠️ PROBLEM FOUND:</p>
          <p className="text-red-200 text-xs mt-1">
            Your wallet ({address.slice(0, 10)}...) is NOT the contract owner.
          </p>
          <p className="text-yellow-300 text-xs mt-2">
            💡 Solution: Switch MetaMask to account ending in ...{contractOwner.slice(-4)}
          </p>
        </div>
      )}

      {addressMatch && (
        <div className="mt-3 p-2 bg-green-900/50 rounded border border-green-500">
          <p className="text-green-300 font-bold text-xs">✅ YOU ARE ADMIN!</p>
          <p className="text-green-200 text-xs mt-1">
            Check navigation - "Admin Panel" should appear!
          </p>
        </div>
      )}
    </div>
  );
};
