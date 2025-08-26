"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "~~/lib/trpc/client";

interface Certificate {
  id: number;
  studentId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  issueDate: string;
  documentHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: certificates, isLoading } = trpc.certificates.getCertificatesByInstitution.useQuery({
    institution: session?.user?.name || "",
  });

  useEffect(() => {
    if (status === "unauthenticated" || session?.user?.role !== "institution") {
      router.push("/auth/institution");
      return;
    }

    if (!session.user.profileData?.isApproved) {
      router.push("/institution/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (certificates) {
      let filtered = [...certificates];

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(
          cert =>
            cert.degree.toLowerCase().includes(search) ||
            cert.studentId.toLowerCase().includes(search)
        );
      }

      setFilteredCertificates(filtered);
    }
  }, [searchTerm, certificates]);

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "institution") {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/institution/dashboard" className="btn btn-ghost btn-sm gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <h1 className="text-xl md:text-2xl font-bold">Certificate Management</h1>
            </div>

            <Link href="/institution/issue-certificate" className="btn btn-primary btn-sm">
              Issue New Certificate
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <h2 className="text-xl font-bold">Issued Certificates</h2>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:max-w-md">
                <input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No certificates found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search or filter criteria."
                : "Start by issuing a new certificate to a recipient."}
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-left py-3 px-4 font-medium">Degree</th>
                    <th className="text-left py-3 px-4 font-medium">Student ID</th>
                    <th className="text-left py-3 px-4 font-medium">Issue Date</th>
                    <th className="text-left py-3 px-4 font-medium">Document Hash</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map(cert => (
                    <tr key={cert.id} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{cert.degree}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p>{cert.studentId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{new Date(cert.issueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <p className="font-mono text-sm break-all">{cert.documentHash}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewCertificate(cert)} className="btn btn-sm btn-outline">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && selectedCertificate && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-base-100 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Certificate Details</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-8 p-8 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                  <h1 className="text-3xl font-serif font-bold mb-2">{selectedCertificate.institution}</h1>
                  <p className="text-lg">Certificate of Achievement</p>
                </div>

                <p className="mb-6 text-lg">This certifies that</p>
                <p className="text-2xl font-bold mb-6">{selectedCertificate.studentId}</p>
                <p className="mb-6 text-lg">has successfully completed</p>
                <p className="text-2xl font-bold mb-6">{selectedCertificate.degree}</p>
                <p className="mb-12 text-lg">
                  Awarded on {new Date(selectedCertificate.issueDate).toLocaleDateString()}
                </p>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Certificate ID</p>
                    <p className="font-mono text-sm">{selectedCertificate.id}</p>
                  </div>
                  <div>
                    <div className="w-24 h-12 border-b border-black dark:border-white mb-2"></div>
                    <p className="text-sm">Signature</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verification Status</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300`}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Blockchain Information</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Document Hash:</span>
                    <p className="font-mono text-sm break-all">{selectedCertificate.documentHash}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Verification URL:</span>
                    <p className="break-all">
                      <a
                        href={`/verify/${selectedCertificate.documentHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Verify Certificate
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <button className="btn btn-outline">Download PDF</button>
                  <button className="btn btn-outline">Share Link</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}