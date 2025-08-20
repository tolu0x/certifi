"use client";

import { useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

// import { fetchFromIPFS, getIPFSGatewayURL } from "~~/utils/ipfs";

interface CertificateData {
  id: number;
  student: string;
  issuer: string;
  ipfsHash: string;
  issueDate: number;
  isRevoked: boolean;
  metadata?: any;
}

interface CertificateResponse {
  student: string;
  issuer: string;
  ipfsHash: string;
  issueDate: bigint;
  isRevoked: boolean;
}

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState("");
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: contract } = useScaffoldContract({
    contractName: "Certifi",
  });

  const verifyCertificate = async () => {
    if (!certificateId || !contract) {
      setError("Please enter a certificate ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch on-chain certificate data
      const certificate = (await contract.read.getCertificate([BigInt(certificateId)])) as CertificateResponse;

      if (!certificate) {
        throw new Error("Certificate not found on blockchain");
      }

      const certData: CertificateData = {
        id: Number(certificateId),
        student: certificate.student,
        issuer: certificate.issuer,
        ipfsHash: certificate.ipfsHash,
        issueDate: Number(certificate.issueDate),
        isRevoked: certificate.isRevoked,
      };

      // Fetch metadata from IPFS
      try {
        // const metadata = await fetchFromIPFS(certData.ipfsHash);
        // certData.metadata = metadata;
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setError("Certificate found but metadata could not be retrieved");
      }

      setCertificateData(certData);
    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to verify certificate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Verify Certificate</h1>

        <div className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={certificateId}
              onChange={e => setCertificateId(e.target.value)}
              placeholder="Enter Certificate ID"
              className="input input-bordered flex-1"
            />
            <button onClick={verifyCertificate} className="btn btn-primary" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-8">
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
            <span>{error}</span>
          </div>
        )}

        {certificateData && (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Certificate Details</h2>
                <p className="text-sm text-gray-500">ID: {certificateData.id}</p>
              </div>
              <div className={`badge ${certificateData.isRevoked ? "badge-error" : "badge-success"}`}>
                {certificateData.isRevoked ? "Revoked" : "Valid"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-medium">{certificateData.student}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issuer</p>
                <p className="font-medium">{certificateData.issuer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-medium">{new Date(certificateData.issueDate * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            {certificateData.metadata && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-lg font-semibold mb-4">Certificate Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{certificateData.metadata.attributes.course}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grade</p>
                    <p className="font-medium">{certificateData.metadata.attributes.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{certificateData.metadata.attributes.studentId}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-sm">{certificateData.metadata.description}</p>
                </div>

                {certificateData.metadata.image && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Certificate Image</p>
                    {/* <img
                      src={getIPFSGatewayURL(certificateData.metadata.image.replace("ipfs://", ""))}
                      alt="Certificate"
                      className="max-w-full h-auto rounded-lg"
                    /> */}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
