"use client";

import { useEffect, useState } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { fetchFromIPFS, getIPFSGatewayURL } from "~~/utils/ipfs";

interface Certificate {
  id: number;
  student: string;
  issuer: string;
  ipfsHash: string;
  issueDate: number;
  isRevoked: boolean;
  metadata?: any;
}

interface CertificateListProps {
  studentAddress: string;
}

export default function CertificateList({ studentAddress }: CertificateListProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: contract } = useScaffoldContract({
    contractName: "Certifi",
  });

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!contract) return;

      try {
        // Get certificate IDs for the student
        const result = await contract.read.getStudentCertificates([studentAddress]);
        const certificateIds = Array.isArray(result) ? result : [];

        // Fetch details for each certificate
        const certPromises = certificateIds.map(async (id: any) => {
          const cert = (await contract.read.getCertificate([id])) as Certificate;
          try {
            const metadata = await fetchFromIPFS(cert.ipfsHash);
            return {
              id: Number(id),
              student: cert.student,
              issuer: cert.issuer,
              ipfsHash: cert.ipfsHash,
              issueDate: Number(cert.issueDate),
              isRevoked: cert.isRevoked,
              metadata,
            };
          } catch (error) {
            console.error(`Error fetching metadata for certificate ${id}:`, error);
            return {
              id: Number(id),
              student: cert.student,
              issuer: cert.issuer,
              ipfsHash: cert.ipfsHash,
              issueDate: Number(cert.issueDate),
              isRevoked: cert.isRevoked,
            };
          }
        });

        const certs = await Promise.all(certPromises);
        setCertificates(certs);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setError("Failed to load certificates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, [contract, studentAddress]);

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
        <span>{error}</span>
      </div>
    );
  }

  if (certificates.length === 0) {
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
      {certificates.map(cert => (
        <div key={cert.id} className="border border-gray-200 dark:border-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">{cert.metadata?.attributes?.course || "Certificate"}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Issued by: {cert.issuer}</p>
            </div>
            <div className={`badge ${cert.isRevoked ? "badge-error" : "badge-success"}`}>
              {cert.isRevoked ? "Revoked" : "Valid"}
            </div>
          </div>

          {cert.metadata?.image && (
            <div className="mb-4">
              <img
                src={getIPFSGatewayURL(cert.metadata.image.replace("ipfs://", ""))}
                alt="Certificate"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Issue Date</p>
              <p className="font-medium">{new Date(cert.issueDate * 1000).toLocaleDateString()}</p>
            </div>
            {cert.metadata?.attributes?.grade && (
              <div>
                <p className="text-sm text-gray-500">Grade</p>
                <p className="font-medium">{cert.metadata.attributes.grade}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <a
              href={`/verify?id=${cert.id}`}
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
