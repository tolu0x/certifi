"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { AcademicCapIcon, MagnifyingGlassIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useAuthSync } from "~~/hooks/useAuthSync";
import { useAuthStore } from "~~/services/store/authStore";

const Home: NextPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  useAuthSync();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">CERTIFI</h1>
          <p className="text-xl max-w-2xl mx-auto mb-12">
            Secure, verifiable academic credentials powered by blockchain technology
          </p>

          {isAuthenticated && user ? (
            <div className="mb-8 p-8 border border-gray-200 dark:border-gray-800 max-w-md mx-auto">
              <p className="mb-6 text-lg">
                Logged in as <span className="font-semibold">{user.role}</span>
              </p>
              <Link
                href={user.role === "institution" ? "/institution/dashboard" : "/student/dashboard"}
                className="btn btn-primary px-8 py-2"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/student" className="btn btn-primary px-8 py-2">
                Student Login
              </Link>
              <Link href="/verify" className="btn btn-outline px-8 py-2">
                Verify a Certificate
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-8">For Students</h2>
              <p className="text-lg mb-6">
                Receive, store, and share your academic credentials securely. Never worry about losing your certificates
                or having to request physical copies again.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ShieldCheckIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Secure Storage</h3>
                    <p>Your credentials are stored securely and accessible anywhere, anytime.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ShieldCheckIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Easy Sharing</h3>
                    <p>Share your verified credentials with employers or other institutions in seconds.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <ShieldCheckIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Tamper-Proof</h3>
                    <p>Blockchain technology ensures your credentials cannot be altered or falsified.</p>
                  </div>
                </div>
              </div>

              <Link href="/auth/student" className="btn btn-primary">
                Access Your Credentials
              </Link>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8">For Verifiers</h2>
              <p className="text-lg mb-6">
                Instantly verify the authenticity of academic credentials. Eliminate fraud and streamline your
                verification process.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Instant Verification</h3>
                    <p>Verify any certificates&apos; authenticity in seconds with our easy-to-use tool.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">No Registration Required</h3>
                    <p>Verify certificates without creating an account or installing any software.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold">Eliminate Fraud</h3>
                    <p>Ensure credentials are legitimate with our blockchain-based verification system.</p>
                  </div>
                </div>
              </div>

              <Link href="/verify" className="btn btn-outline">
                Verify a Certificate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full flex items-center justify-center mx-auto mb-6">
                <p className="text-2xl font-bold">1</p>
              </div>
              <h3 className="text-xl font-semibold mb-4">Institutions Issue</h3>
              <p>Educational institutions issue tamper-proof digital certificates secured by blockchain technology.</p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full flex items-center justify-center mx-auto mb-6">
                <p className="text-2xl font-bold">2</p>
              </div>
              <h3 className="text-xl font-semibold mb-4">Students Receive</h3>
              <p>Students access and manage their digital credentials through a secure online portal.</p>
            </div>
            <div className="p-6 border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full flex items-center justify-center mx-auto mb-6">
                <p className="text-2xl font-bold">3</p>
              </div>
              <h3 className="text-xl font-semibold mb-4">Anyone Verifies</h3>
              <p>Employers and other institutions can instantly verify the authenticity of credentials.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
