"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function StudentDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    router.replace("/auth/student");
    return null;
  }

  const placeholderCertificates = [
    { id: "cert-1", title: "B.Ed Certificate", issuer: "Lagos State University", issueDate: "2026-07-15" },
    { id: "cert-2", title: "Web Development Course", issuer: "Tech Academy", issueDate: "2025-03-10" },
  ];

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

        {placeholderCertificates.length === 0 ? (
          <div className="bg-base-200 p-12 rounded-lg text-center">
            <p className="text-lg mb-4">You don&apos;t have any certificates yet.</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              When an institution issues you a certificate, it will appear here.
            </p>
            <button className="btn btn-primary">Learn How It Works</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {placeholderCertificates.map(cert => (
              <div key={cert.id} className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{cert.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Issued by: {cert.issuer}</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded mb-4 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300 dark:text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0-.55.45-1 1-1h2V9c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1z" />
                  </svg>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 btn btn-sm btn-primary">View</button>
                  <button className="flex-1 btn btn-sm btn-outline">Share</button>
                  <button className="btn btn-sm btn-outline">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <h3 className="text-lg font-semibold mb-4">Share with Employers</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate special links to share your certificates with potential employers.
          </p>
          <button className="btn btn-outline w-full">Create Sharing Link</button>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Verify a Certificate</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Verify the authenticity of certificates from other institutions.
          </p>
          <Link href="/verify" className="btn btn-outline w-full">
            Verify Certificate
          </Link>
        </div>
      </div>
    </div>
  );
}
