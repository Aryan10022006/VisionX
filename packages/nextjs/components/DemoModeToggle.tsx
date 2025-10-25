"use client";

import { useState, useEffect } from "react";

/**
 * Demo Mode Toggle - Quick switch to enable demo with mock data
 */
export const DemoModeToggle = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const demoMode = localStorage.getItem("propshare_demo_mode");
    setIsDemoMode(demoMode === "true");
  }, []);

  const toggleDemoMode = () => {
    if (isDemoMode) {
      localStorage.removeItem("propshare_demo_mode");
    } else {
      localStorage.setItem("propshare_demo_mode", "true");
    }
    window.location.reload();
  };

  if (!isMounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleDemoMode}
        className={`btn btn-sm gap-2 ${isDemoMode ? "btn-success" : "btn-warning"}`}
        title={isDemoMode ? "Disable Demo Mode" : "Enable Demo Mode - Show Mock Data"}
      >
        {isDemoMode ? (
          <>
            <span className="text-lg">✅</span>
            <span>DEMO MODE ON</span>
          </>
        ) : (
          <>
            <span className="text-lg">🎬</span>
            <span>Enable Demo Mode</span>
          </>
        )}
      </button>
      {isDemoMode && (
        <div className="mt-2 p-2 bg-success text-success-content rounded-lg text-xs">
          <p className="font-bold">📹 Recording Mode Active</p>
          <p>Showing mock data for demo</p>
        </div>
      )}
    </div>
  );
};
