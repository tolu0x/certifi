"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";
import { trpc } from "~~/lib/trpc/client";

export default function InstitutionDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: statsData, isLoading: isLoadingStats } = trpc.institutions.getInstitutionStats.useQuery({
    institution: session?.user?.name || "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/institution");
    } else if (session?.user?.role !== "institution") {
      
      router.push("/auth/institution");
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    disconnect();
    router.push("/auth/institution");
  };

  if (status === "loading" || !session) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Institution Dashboard</h1>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Connected:</span>
                <span className="text-sm font-mono">
                  {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                </span>
              </div>

              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="cursor-pointer flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="font-bold">{session.user.name?.charAt(0) || "I"}</span>
                  </div>
                  <span className="font-medium hidden md:inline">{session.user.name || "Institution"}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-gray-200 dark:border-gray-800"
                >
                  <li>
                    <button onClick={handleLogout} className="text-red-600 dark:text-red-400 gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!session.user.profileData?.isApproved && (
          <div className="mb-8 p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Institution Verification Pending</h3>
                <p className="mt-1 text-yellow-700 dark:text-yellow-400">
                  Your institution is currently under review. You&apos;ll be able to issue certificates once your
                  institution is approved. This process typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Issued Certificates</h3>
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{Number(statsData?.issuedCertificates) || 0}</span>
              <span className="text-green-500 dark:text-green-400 text-sm">+12 this month</span>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Active Students</h3>
              <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{Number(statsData?.activeStudents) || 0}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Total recipients</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/institution/issue-certificate"
            className={`border border-gray-200 dark:border-gray-800 p-6 rounded-lg hover:border-black dark:hover:border-white transition duration-200 ${!session.user.profileData?.isApproved ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Issue New Certificate</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create and issue a new blockchain-verified certificate to a student or professional.
            </p>
            <div className="text-sm font-medium flex items-center gap-1 text-black dark:text-white">
              <span>Issue Certificate</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

          <Link
            href="/institution/certificates"
            className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg hover:border-black dark:hover:border-white transition duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">View Certificates</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View and manage all certificates issued by your institution.
            </p>
            <div className="text-sm font-medium flex items-center gap-1 text-black dark:text-white">
              <span>View Certificates</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>

          <Link
            href="/institution/students"
            className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg hover:border-black dark:hover:border-white transition duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Manage Students</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View and manage student records and their certificate status.
            </p>
            <div className="text-sm font-medium flex items-center gap-1 text-black dark:text-white">
              <span>Manage Students</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}