"use client";

import { useRouter } from "next/navigation";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { signIn } from "next-auth/react";

export default function InstitutionAuth() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();

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
    <div className="flex items-center justify-center min-h-screen">
      <button onClick={() => login()}>Log in</button>
    </div>
  );
}
