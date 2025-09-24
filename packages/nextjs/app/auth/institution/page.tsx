"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { signIn } from "next-auth/react";

export default function InstitutionAuth() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/institution/dashboard");
    }
  }, [ready, authenticated, router]);

  const { login } = useLogin({
    onComplete: async ({ user }) => {
      if (user.wallet?.address && user.id) {
        // Sync Privy user with NextAuth session using privyId and address
        await signIn("web3", {
          address: user.wallet.address,
          role: "institution",
          privyId: user.id,
          redirect: false,
        });

        router.push("/institution/dashboard");
      } else {
        console.error("Missing wallet address or privyId.");
      }
    },
  });

  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 px-4">
      <div className="max-w-md w-full bg-white dark:bg-base-200 rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-center">
          Institution Portal
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
          Secure access for educational institutions to issue certificates
        </p>
        <button onClick={() => login()} className="btn btn-primary w-full">
          Log in
        </button>
      </div>
    </div>
  );
}
