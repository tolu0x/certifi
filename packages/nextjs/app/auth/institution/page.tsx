"use client";

import { useRouter } from "next/navigation";
import { useLogin } from "@privy-io/react-auth";
import { useAuthStore } from "~~/services/store/authStore";

export default function InstitutionAuth() {
  const router = useRouter();
  const { login: loginToStore, user: authUser } = useAuthStore();

  const {login} = useLogin({
      onComplete: async ({ user }) => {
        if (user.wallet?.address) {
          loginToStore(user.wallet.address, "institution");
          console.log("added to store");
          if (authUser?.onboardingCompleted) {
            console.log("to dashboard")
            router.push("/institution/dashboard");
          } else {
            console.log("to onboarding")
            router.push("/institution/onboarding");
          }
        } else {
          // Handle missing wallet/address case if needed
          console.error("User wallet address is undefined.");
        }
      },
    });


  return (
    <div className="flex items-center justify-center min-h-screen">
      <button onClick={() => login()}>Log in</button>
    </div>
  );
}
