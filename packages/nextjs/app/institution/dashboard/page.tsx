"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { useAuthSync } from "~~/hooks/useAuthSync";
import { useAuthStore } from "~~/services/store/authStore";

export default function InstitutionDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [statsData, setStatsData] = useState({
    issuedCertificates: 0,
    pendingApprovals: 0,
    activeStudents: 0,
  });

  useAuthSync();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "institution") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    setStatsData({
      issuedCertificates: 28,
      pendingApprovals: 3,
      activeStudents: 42,
    });
  }, []);

  const handleLogout = () => {
    logout();
    disconnect();
    router.push("/admin");
  };

  if (!isAuthenticated || user?.role !== "institution") {
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
                    <span className="font-bold">{user.name?.charAt(0) || "I"}</span>
                  </div>
                  <span className="font-medium hidden md:inline">{user.name || "Institution"}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-gray-200 dark:border-gray-800"
                >
                  <li>
                    <Link href="/institution/profile" className="gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/institution/settings" className="gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </Link>
                  </li>
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
        {!user.profileData?.isApproved && (
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
              <span className="text-3xl font-bold">{statsData.issuedCertificates}</span>
              <span className="text-green-500 dark:text-green-400 text-sm">+12 this month</span>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium">Pending Approvals</h3>
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{statsData.pendingApprovals}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Need review</span>
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
              <span className="text-3xl font-bold">{statsData.activeStudents}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Total recipients</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/institution/issue-certificate"
            className={`border border-gray-200 dark:border-gray-800 p-6 rounded-lg hover:border-black dark:hover:border-white transition duration-200 ${!user.profileData?.isApproved ? "opacity-50 pointer-events-none" : ""}`}
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
            <h3 className="text-xl font-semibold mb-2">Certificate History</h3>
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
            href="/institution/profile"
            className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg hover:border-black dark:hover:border-white transition duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Institution Profile</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage your institution details and preferences.</p>
            <div className="text-sm font-medium flex items-center gap-1 text-black dark:text-white">
              <span>Edit Profile</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-left py-3 px-4 font-medium">Activity</th>
                    <th className="text-left py-3 px-4 font-medium">Details</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4">Certificate Issued</td>
                    <td className="py-3 px-4">B.Ed Certificate for John Doe</td>
                    <td className="py-3 px-4">May 10, 2025</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4">Certificate Issued</td>
                    <td className="py-3 px-4">M.Sc Certificate for Jane Smith</td>
                    <td className="py-3 px-4">May 8, 2025</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-800">
                    <td className="py-3 px-4">Profile Updated</td>
                    <td className="py-3 px-4">Institution details updated</td>
                    <td className="py-3 px-4">May 5, 2025</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                        System
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
