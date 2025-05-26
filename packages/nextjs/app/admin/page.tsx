"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { verifyMessage } from "ethers";
import { useAccount, useSignMessage } from "wagmi";
import { useAuthSync } from "~~/hooks/useAuthSync";
import { useAuthStore } from "~~/services/store/authStore";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuthStore();
  const { address, isConnected } = useAccount();
  const { data: signature, isPending: isSignLoading, signMessage } = useSignMessage();
  const [authStep, setAuthStep] = useState<"connect" | "sign" | "verifying" | "complete">("connect");
  const [signError, setSignError] = useState<string | null>(null);

  useAuthSync();

  useEffect(() => {
    if (isAuthenticated && user?.role === "institution") {
      router.push("/institution/dashboard");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isConnected && address) {
      setAuthStep("sign");
    } else {
      setAuthStep("connect");
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (signature && address && authStep === "verifying") {
      // TODO: Verify signature on backend
      const message = `Sign this message to authenticate with Certifi as an institution. Wallet address: ${address}`;

      try {
        const recoveredAddress = verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
          login(address, "institution", { isApproved: true });
          setAuthStep("complete");

          // Check if user has completed onboarding
          const storedUser = localStorage.getItem(`certifi-auth-storage`);
          const hasCompletedOnboarding = storedUser && JSON.parse(storedUser).state.user?.name;

          if (hasCompletedOnboarding) {
            router.push("/institution/dashboard");
          } else {
            router.push("/institution/onboarding");
          }
        } else {
          setSignError("Signature verification failed. Please try again.");
          setAuthStep("sign");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setSignError("Error during verification. Please try again.");
        setAuthStep("sign");
      }
    }
  }, [signature, address, authStep, login, router]);

  const handleSignMessage = async () => {
    setSignError(null);

    try {
      setAuthStep("verifying");
      const message = `Sign this message to authenticate with Certifi as an institution. Wallet address: ${address}`;
      signMessage({ message });
    } catch (error) {
      console.error("Signing error:", error);
      setSignError("Error during signing. Please try again.");
      setAuthStep("sign");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Institution Portal</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure access for educational institutions to issue certificates
          </p>
        </div>

        <div className="p-8 border border-gray-200 dark:border-gray-800">
          <div className="mb-8">
            {authStep === "connect" && (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Step 1: Connect Wallet</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Connect your institutional wallet to authenticate and access your dashboard.
                </p>

                <div className="flex justify-center mb-4">
                  <ConnectButton label="Connect Institutional Wallet" showBalance={false} />
                </div>
              </div>
            )}

            {authStep === "sign" && (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Step 2: Verify Identity</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Sign a message with your wallet to verify your identity and access your institution dashboard.
                </p>

                <div className="p-4 bg-base-200 rounded-lg mb-6">
                  <p className="text-sm font-mono break-all">
                    Wallet address:{" "}
                    {address ? address.substring(0, 6) + "..." + address.substring(address.length - 4) : ""}
                  </p>
                </div>

                <button onClick={handleSignMessage} disabled={isSignLoading} className="btn btn-primary w-full">
                  {isSignLoading ? "Waiting for signature..." : "Sign Message"}
                </button>

                {signError && (
                  <div className="mt-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    {signError}
                  </div>
                )}
              </div>
            )}

            {authStep === "verifying" && (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Verifying Signature</h2>
                <div className="flex justify-center mb-4">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your signature...</p>
              </div>
            )}

            {authStep === "complete" && (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Authentication Successful</h2>
                <div className="mb-4 flex justify-center">
                  <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have been successfully authenticated. Redirecting to your dashboard...
                </p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
            <p className="mb-2">
              <strong>Security Note:</strong> Certifi never stores your private keys. All transactions are signed
              directly through your wallet.
            </p>
            <p>If you need assistance, please contact our support team at support@certifi.edu.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
