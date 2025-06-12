"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export default function StudentAuth() {
  const { status } = useSession();

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/student/onboarding",
      });
    } catch (error) {
      console.error("Auth: Sign in error:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Student Portal</h1>
          <p className="text-gray-600 dark:text-gray-400">Access and manage your academic credentials securely</p>
        </div>

        <div className="p-8 border border-gray-200 dark:border-gray-800">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign in to your account</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Access your certificates, share credentials with employers, and verify authenticity.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 btn btn-outline hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="fill-current"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

          <div className="mt-8 text-sm text-center">
            <p className="text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need to verify a certificate?{" "}
            <Link href="/verify" className="underline hover:no-underline">
              Verify a Certificate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
