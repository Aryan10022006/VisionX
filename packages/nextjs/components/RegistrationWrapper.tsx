"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { RegistrationModal } from "./RegistrationModal";
import { useAuth } from "~~/hooks/useAuth";

/**
 * Wrapper component to enforce user registration
 * Shows registration modal if user is connected but not registered
 */
export const RegistrationWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, address } = useAccount();
  const { isRegistered, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only show modal if connected but not registered, and not already showing
    if (!isLoading && isConnected && !isRegistered && address) {
      // Small delay to ensure auth has fully loaded
      const timer = setTimeout(() => {
        // Check again to avoid race conditions
        const hasRegistered = localStorage.getItem(`propshare_registered_${address?.toLowerCase()}`);
        if (!hasRegistered) {
          setShowModal(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else if (isRegistered) {
      // Hide modal if user becomes registered
      setShowModal(false);
    }
  }, [isConnected, isRegistered, isLoading, address]);

  const handleSuccess = () => {
    // Save registration status to localStorage
    if (address) {
      localStorage.setItem(`propshare_registered_${address.toLowerCase()}`, "true");
    }
    setShowModal(false);
    // Don't reload - just close modal and update state naturally
  };

  const handleClose = () => {
    // Don't allow closing if not registered (enforce registration)
    if (!isRegistered && isConnected) {
      return; // Simply ignore close attempts
    }
    setShowModal(false);
  };

  return (
    <>
      {children}
      {showModal && (
        <RegistrationModal 
          isOpen={showModal} 
          onClose={handleClose} 
          onSuccess={handleSuccess} 
        />
      )}
    </>
  );
};
