"use client";

import { useEffect } from "react";
import { useAuthStore } from "../services/store/authStore";
import { useAccount } from "wagmi";

/**
 * Hook to synchronize wallet connection status with auth state
 */
export const useAuthSync = () => {
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated, logout, setLoading } = useAuthStore();

  // Sync wallet connection with auth state
  useEffect(() => {
    // If wallet disconnects, log out
    if (!isConnected && isAuthenticated) {
      logout();
    }

    // If wallet address changes, log out (address mismatch)
    if (isConnected && address && user && address !== user.address) {
      logout();
    }

    setLoading(false);
  }, [address, isConnected, isAuthenticated, user, logout, setLoading]);

  return { isWalletConnected: isConnected, walletAddress: address };
};
