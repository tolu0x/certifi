"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuthStore } from "~~/services/store/authStore";
import { UserRole } from "~~/types/auth";

interface WalletConnectProps {
  userRole: UserRole;
  redirectPath?: string;
}

export const WalletConnect = ({ userRole, redirectPath }: WalletConnectProps) => {
  const router = useRouter();
  const { login } = useAuthStore();
  const { address, isConnected } = useAccount();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleContinue = () => {
    if (!address || !isConnected) return;

    setIsRegistering(true);

    try {
      login(address, userRole);

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        if (userRole === "institution") {
          router.push("/institution/dashboard");
        } else if (userRole === "student") {
          router.push("/student/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-semibold">
        {userRole === "institution" ? "Institution Authentication" : "Student Authentication"}
      </h2>

      <p className="text-center max-w-md text-gray-600 dark:text-gray-400">
        {userRole === "institution"
          ? "Connect your wallet to register your institution and start issuing digital certificates on the blockchain."
          : "Connect your wallet to access and manage your credentials stored on the blockchain."}
      </p>

      <div className="w-full max-w-xs">
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, openChainModal }) => {
            const connected = account && chain;

            return (
              <div className="w-full">
                {!connected ? (
                  <button onClick={openConnectModal} className="w-full btn btn-primary">
                    Connect Wallet
                  </button>
                ) : chain.unsupported ? (
                  <button onClick={openChainModal} className="w-full btn btn-error">
                    Switch Network
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded w-full text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connected Address</p>
                      <p className="font-mono text-sm truncate">{account.address}</p>
                    </div>

                    <button onClick={handleContinue} disabled={isRegistering} className="w-full btn btn-primary">
                      {isRegistering
                        ? "Processing..."
                        : "Continue as " + (userRole === "institution" ? "Institution" : "Student")}
                    </button>
                  </div>
                )}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
        By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};
