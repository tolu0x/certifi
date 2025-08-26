"use client";

import { useRouter } from "next/navigation";
import CertificateList from "./components/CertificateList";
import { signOut, useSession } from "next-auth/react";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    router.replace("/auth/student");
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{session?.user?.name || "Student"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email || ""}</p>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-sm btn-outline">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Certificates</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="Search certificates..." className="input input-bordered w-64" />
            <select className="select select-bordered">
              <option value="">All Issuers</option>
              <option value="Lagos State University">Lagos State University</option>
              <option value="Tech Academy">Tech Academy</option>
            </select>
          </div>
        </div>

        <CertificateList studentId={session?.user?.id || ""} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Update your personal information and notification preferences.
          </p>
          <button className="btn btn-outline w-full">Edit Profile</button>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Verify a Certificate</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Verify the authenticity of certificates from other institutions.
          </p>
          <a href="/verify" className="btn btn-outline w-full">
            Verify Certificate
          </a>
        </div>
      </div>
    </div>
  );
}
