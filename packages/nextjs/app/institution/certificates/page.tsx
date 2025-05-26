"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSync } from "~~/hooks/useAuthSync";
import { useAuthStore } from "~~/services/store/authStore";

interface Certificate {
  id: string;
  title: string;
  recipientName: string;
  recipientEmail: string;
  issueDate: string;
  status: "active" | "revoked" | "expired";
  credentialHash: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked" | "expired">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useAuthSync();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "institution") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const mockCertificates: Certificate[] = [
      {
        id: "cert-001",
        title: "Bachelor of Education",
        recipientName: "John Doe",
        recipientEmail: "john.doe@example.com",
        issueDate: "2025-05-10",
        status: "active",
        credentialHash: "0x8a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
      },
      {
        id: "cert-002",
        title: "Master of Science",
        recipientName: "Jane Smith",
        recipientEmail: "jane.smith@example.com",
        issueDate: "2025-05-08",
        status: "active",
        credentialHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      },
      {
        id: "cert-003",
        title: "Data Science Certificate",
        recipientName: "Bob Johnson",
        recipientEmail: "bob.johnson@example.com",
        issueDate: "2025-04-20",
        status: "active",
        credentialHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
      },
      {
        id: "cert-004",
        title: "Professional Development",
        recipientName: "Alice Brown",
        recipientEmail: "alice.brown@example.com",
        issueDate: "2025-03-15",
        status: "revoked",
        credentialHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
      },
      {
        id: "cert-005",
        title: "Executive Leadership",
        recipientName: "Charlie Wilson",
        recipientEmail: "charlie.wilson@example.com",
        issueDate: "2024-12-05",
        status: "expired",
        credentialHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
      },
    ];

    setCertificates(mockCertificates);
    setFilteredCertificates(mockCertificates);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (certificates.length > 0) {
      let filtered = [...certificates];

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(
          cert =>
            cert.title.toLowerCase().includes(search) ||
            cert.recipientName.toLowerCase().includes(search) ||
            cert.recipientEmail.toLowerCase().includes(search) ||
            cert.id.toLowerCase().includes(search),
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter(cert => cert.status === statusFilter);
      }

      setFilteredCertificates(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, certificates]);

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
  };

  if ((!isAuthenticated || user?.role !== "institution") && !isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
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

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
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
              {searchTerm || statusFilter !== "all"
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
                    <th className="text-left py-3 px-4 font-medium">Certificate</th>
                    <th className="text-left py-3 px-4 font-medium">Recipient</th>
                    <th className="text-left py-3 px-4 font-medium">Issue Date</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map(cert => (
                    <tr key={cert.id} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{cert.id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p>{cert.recipientName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{cert.recipientEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{new Date(cert.issueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            cert.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : cert.status === "revoked"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          }`}
                        >
                          {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewCertificate(cert)} className="btn btn-sm btn-outline">
                            View
                          </button>
                          {cert.status === "active" && <button className="btn btn-sm btn-error">Revoke</button>}
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
                  <h1 className="text-3xl font-serif font-bold mb-2">{user?.name || "Institution Name"}</h1>
                  <p className="text-lg">Certificate of Achievement</p>
                </div>

                <p className="mb-6 text-lg">This certifies that</p>
                <p className="text-2xl font-bold mb-6">{selectedCertificate.recipientName}</p>
                <p className="mb-6 text-lg">has successfully completed</p>
                <p className="text-2xl font-bold mb-6">{selectedCertificate.title}</p>
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
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedCertificate.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : selectedCertificate.status === "revoked"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      }`}
                    >
                      {selectedCertificate.status.charAt(0).toUpperCase() + selectedCertificate.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Blockchain Information</h3>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credential Hash:</span>
                    <p className="font-mono text-sm break-all">{selectedCertificate.credentialHash}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Verification URL:</span>
                    <p className="break-all">
                      <a
                        href={`/verify/${selectedCertificate.id}`}
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

                {selectedCertificate.status === "active" && (
                  <button className="btn btn-error">Revoke Certificate</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
