"use client";

import { trpc } from "~~/lib/trpc/client";

interface CertificateListProps {
  studentId: string;
}

export default function CertificateList({ studentId }: CertificateListProps) {
  const {
    data: certificates,
    isLoading,
    error,
  } = trpc.certificates.getCertificatesByStudent.useQuery({
    studentId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error.message}</span>
      </div>
    );
  }

  if (certificates?.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg mb-4">You don&apos;t have any certificates yet.</p>
        <p className="text-gray-500 dark:text-gray-400">
          When an institution issues you a certificate, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {certificates?.map(cert => (
        <div key={cert.id} className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">{cert.degree}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Issued by: {cert.institution}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium">{new Date(cert.issueDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`/verify?hash=${cert.documentHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn btn-sm btn-primary"
            >
              View
            </a>
            <button className="flex-1 btn btn-sm btn-outline">Share</button>
          </div>
        </div>
      ))}
    </div>
  );
}
