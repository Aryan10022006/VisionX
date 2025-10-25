"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~~/hooks/useAuth";
import { RegistrationModal } from "./RegistrationModal";

interface ProtectedRouteProps {
  children: ReactNode;
  requiresRegistration?: boolean;
  requiresAdmin?: boolean;
}

/**
 * Protected route wrapper
 * Enforces authentication and registration requirements
 */
export const ProtectedRoute = ({
  children,
  requiresRegistration = false,
  requiresAdmin = false,
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { isConnected, isRegistered, isAdmin, isLoading } = useAuth();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    
    // Check wallet connection
    if (!isConnected) {
      // Don't redirect immediately, allow user to see the page and connect
      setHasChecked(true);
      return;
    }

    // Check registration requirement
    if (requiresRegistration && !isRegistered) {
      setShowRegistrationModal(true);
      setHasChecked(true);
      return;
    }

    // Check admin requirement
    if (requiresAdmin && !isAdmin) {
      router.push("/?error=admin-only");
      return;
    }

    setHasChecked(true);
  }, [isConnected, isRegistered, isAdmin, isLoading, requiresRegistration, requiresAdmin, router]);

  // Show loading state
  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Show connect wallet message if not connected and registration required
  if (!isConnected && requiresRegistration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Wallet Connection Required</h2>
          <p className="text-base-content/70 mb-6">
            Please connect your wallet to access this page
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/")}
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Show registration modal if needed
  if (showRegistrationModal) {
    return (
      <>
        {children}
        <RegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => {
            setShowRegistrationModal(false);
            router.push("/");
          }}
          onSuccess={() => {
            setShowRegistrationModal(false);
            window.location.reload(); // Reload to update auth state
          }}
        />
      </>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

/**
 * Admin-only route wrapper
 * Convenience wrapper for admin pages
 */
export const AdminRoute = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requiresRegistration={true} requiresAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * Registered user route wrapper
 * Convenience wrapper for pages requiring registration
 */
export const RegisteredRoute = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requiresRegistration={true}>
      {children}
    </ProtectedRoute>
  );
};
