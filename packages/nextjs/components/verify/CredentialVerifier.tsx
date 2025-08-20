import React, { useEffect, useState } from "react";
import { useGetCredentialMetadata, useVerifyCredential } from "../../services/web3/certifiContract";
import QRCodeScanner from "./QRCodeScanner";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldCheckIconSolid } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

export type VerificationMethod = "id" | "qr" | "file" | null;

export type CredentialMetadata = {
  title: string;
  type: string;
  program?: string;
  grade?: string;
  achievements?: string[];
  institution: {
    name: string;
    website?: string;
    logo?: string;
  };
  recipient: {
    name: string;
    id: string;
  };
};

interface CredentialVerifierProps {
  verificationMethod: VerificationMethod;
  onReset: () => void;
}

const CredentialVerifier: React.FC<CredentialVerifierProps> = ({ verificationMethod, onReset }) => {
  const [credentialId, setCredentialId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [qrValue, setQrValue] = useState("");
  const [credentialHash, setCredentialHash] = useState<string | null>(null);
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [metadata, setMetadata] = useState<CredentialMetadata | null>(null);
  const [transactionInfo, setTransactionInfo] = useState<{
    blockNumber: number;
    transactionHash: string;
  } | null>(null);

  // Fetch verification result from smart contract
  const { result, isLoading, error } = useVerifyCredential(credentialHash);
  const { fetchMetadata } = useGetCredentialMetadata();

  // Fetch credential issuance events
  const { data: credentialEvents } = useScaffoldEventHistory({
    contractName: "Certifi",
    eventName: "CredentialIssued",
    fromBlock: 0n,
    filters: credentialHash ? { credentialHash } : undefined,
    enabled: !!credentialHash,
  });

  // Prepare verification status
  const verificationStatus = isLoading ? "loading" : error ? "error" : result?.isValid ? "success" : "error";

  // Fetch metadata when we have a result
  useEffect(() => {
    const getMetadata = async () => {
      if (result && result.isValid && result.metadataURI) {
        try {
          const metadataResponse = await fetchMetadata(result.metadataURI);
          if (metadataResponse) {
            setMetadata(metadataResponse);
          }
        } catch (e) {
          console.error("Failed to fetch credential metadata:", e);
        }
      }
    };

    getMetadata();
  }, [result, fetchMetadata]);

  useEffect(() => {
    if (credentialEvents && credentialEvents.length > 0) {
      const event = credentialEvents[0];

      setTransactionInfo({
        blockNumber: Number(event.blockNumber),
        transactionHash: event.transactionHash,
      });
    }
  }, [credentialEvents]);

  // Convert credential ID to hash when submitting
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    let hashToVerify = "";

    if (verificationMethod === "id") {
      // Convert ID to hash - in a real app you might make an API call
      // For demo, we'll just use the ID as a stand-in for a hash
      hashToVerify = `0x${credentialId.replace(/[^a-zA-Z0-9]/g, "")}`;
    } else if (verificationMethod === "qr") {
      // Extract hash from QR code
      hashToVerify = qrValue.startsWith("0x") ? qrValue : `0x${qrValue.replace(/[^a-zA-Z0-9]/g, "")}`;
    } else if (verificationMethod === "file" && file) {
      // In a real app, you'd extract the credential hash from the file
      // For demo, we'll use the filename
      hashToVerify = `0x${file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "")}`;
    }

    // Pad the hash to ensure it's 32 bytes
    while (hashToVerify.length < 66) {
      hashToVerify += "0";
    }

    setCredentialHash(hashToVerify);
  };

  const handleQrCodeDetected = (code: string) => {
    setQrValue(code);
    // Automatically submit if we get a QR code
    const hashToVerify = code.startsWith("0x") ? code : `0x${code.replace(/[^a-zA-Z0-9]/g, "")}`;
    setCredentialHash(hashToVerify);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you would add a toast notification here
  };

  // Generate a verification report and download it
  const downloadVerificationReport = () => {
    if (!result || !metadata) return;

    const reportData = {
      credential: {
        id: credentialId || qrValue || file?.name || "",
        hash: credentialHash,
        title: metadata.title,
        type: metadata.type,
        issueDate: result.issueDate.toISOString(),
      },
      issuer: {
        address: result.issuer,
        name: metadata.institution.name,
        website: metadata.institution.website,
      },
      recipient: metadata.recipient,
      verification: {
        status: result.isValid ? "Valid" : "Invalid",
        timestamp: new Date().toISOString(),
        blockchainInfo: transactionInfo,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verification-${credentialHash?.substring(2, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formattedIssueDate = result?.issueDate.toLocaleDateString();
  const verificationTimestamp = new Date().toISOString();

  // Render verification form when idle
  if (!credentialHash) {
    return (
      <div className="mt-8">
        <button onClick={onReset} className="text-sm flex items-center mb-6 hover:underline">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to verification methods
        </button>

        <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">
            {verificationMethod === "id"
              ? "Verify with Certificate ID"
              : verificationMethod === "qr"
                ? "Verify with QR Code"
                : "Upload Certificate"}
          </h2>

          <form onSubmit={handleVerify}>
            {verificationMethod === "id" ? (
              <div className="mb-6">
                <label htmlFor="certificateId" className="block text-sm font-medium mb-2">
                  Certificate ID
                </label>
                <input
                  type="text"
                  id="certificateId"
                  value={credentialId}
                  onChange={e => setCredentialId(e.target.value)}
                  placeholder="Enter the certificate ID (e.g., CERT-123456)"
                  className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the unique ID printed on the certificate
                </p>
              </div>
            ) : verificationMethod === "qr" ? (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">QR Code</label>

                <div className="mb-4">
                  <QRCodeScanner onCodeDetected={handleQrCodeDetected} />
                </div>

                <div className="my-4 text-center text-sm text-gray-600 dark:text-gray-400">- OR -</div>

                <label htmlFor="qrCode" className="block text-sm font-medium mb-2">
                  QR Code Value
                </label>
                <input
                  type="text"
                  id="qrCode"
                  value={qrValue}
                  onChange={e => setQrValue(e.target.value)}
                  placeholder="Enter the code from the certificate QR"
                  className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                  required={!file}
                />
              </div>
            ) : (
              <div className="mb-6">
                <label htmlFor="certificateFile" className="block text-sm font-medium mb-2">
                  Certificate File
                </label>
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  {file ? (
                    <div>
                      <p className="mb-2 text-sm font-medium">{file.name}</p>
                      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-sm text-red-600 dark:text-red-400 underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
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
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Drag and drop your certificate file here, or click to browse
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: PDF, JPG, PNG (max 10MB)
                      </p>
                      <input
                        type="file"
                        id="certificateFile"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                      <label
                        htmlFor="certificateFile"
                        className="mt-4 inline-block cursor-pointer btn btn-sm btn-outline"
                      >
                        Browse Files
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={
                (verificationMethod === "id" && !credentialId) ||
                (verificationMethod === "file" && !file) ||
                (verificationMethod === "qr" && !qrValue)
              }
            >
              Verify Certificate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render loading state
  if (verificationStatus === "loading") {
    return (
      <div className="p-12 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex flex-col items-center">
        <div className="loading loading-spinner loading-lg mb-6"></div>
        <h3 className="text-xl font-semibold mb-2">Verifying Certificate</h3>
        <p className="text-gray-600 dark:text-gray-400">Checking certificate authenticity on the blockchain...</p>
      </div>
    );
  }

  // Render success state
  if (verificationStatus === "success" && result && metadata) {
    return (
      <div>
        <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm mb-8">
          <div className="flex items-center mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-full mr-4">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Certificate Verified</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verified on {new Date(verificationTimestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Certificate Preview */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black text-center flex flex-col">
              <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-4">
                <h3 className="text-lg font-serif uppercase tracking-wide mb-1">{metadata.institution.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Certificate of Achievement</p>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <p className="text-sm mb-2">This certifies that</p>
                <p className="text-xl font-bold mb-4">{metadata.recipient.name}</p>
                <p className="text-sm mb-2">has successfully completed</p>
                <p className="text-xl font-bold mb-4">{metadata.title}</p>

                {metadata.grade && <p className="text-sm mb-4">With {metadata.grade} honors</p>}

                <p className="text-sm">Issued on {formattedIssueDate}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Certificate ID</p>
                  <p className="text-sm font-mono">{credentialId || qrValue || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recipient ID</p>
                  <p className="text-sm">{metadata.recipient.id}</p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Certificate Details</h3>
              <div className="space-y-4">
                {(credentialId || qrValue) && (
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Certificate ID</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{credentialId || qrValue}</p>
                      <button
                        onClick={() => copyToClipboard(credentialId || qrValue)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                  <p className="font-medium">{metadata.title}</p>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recipient</p>
                  <p className="font-medium">{metadata.recipient.name}</p>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Issuing Institution</p>
                  <p className="font-medium">{metadata.institution.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Issue Date</p>
                    <p className="font-medium">{formattedIssueDate}</p>
                  </div>
                </div>

                {metadata.achievements && metadata.achievements.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
                    <ul className="list-disc list-inside">
                      {metadata.achievements.map((achievement, index) => (
                        <li key={index} className="font-medium">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blockchain Verification */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-base-200/50 dark:bg-base-300/20">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => setShowBlockchainDetails(!showBlockchainDetails)}
            >
              <div className="flex items-center">
                <ShieldCheckIconSolid className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="font-medium">Blockchain Verification</h4>
              </div>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${showBlockchainDetails ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {showBlockchainDetails && (
              <div className="space-y-3 pt-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Credential Hash</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-xs truncate">{credentialHash}</p>
                      <button
                        onClick={() => copyToClipboard(credentialHash || "")}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Issuer Address</p>
                    <div className="flex items-center justify-between">
                      <Address address={result.issuer} size="sm" />
                      <button
                        onClick={() => copyToClipboard(result.issuer)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {transactionInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Transaction Hash</p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs truncate">{transactionInfo.transactionHash}</p>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => copyToClipboard(transactionInfo.transactionHash)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${transactionInfo.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Block Number</p>
                      <p className="font-mono">{transactionInfo.blockNumber.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                  <p>
                    This certificate&apos;s authenticity has been cryptographically verified on the blockchain. The
                    digital signature confirms it was issued by the claimed institution and has not been tampered with.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center mt-8 gap-4">
            <button onClick={onReset} className="btn btn-outline gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              Verify Another Certificate
            </button>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShareModalOpen(true)} className="btn btn-outline gap-2">
                <ShareIcon className="h-4 w-4" />
                Share
              </button>

              <button onClick={downloadVerificationReport} className="btn btn-primary gap-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Share Certificate</h3>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Share this verified certificate with others using the link below:
                </p>

                <div className="flex">
                  <input
                    type="text"
                    value={`https://certifi.example/verify/${credentialHash}`}
                    readOnly
                    className="flex-grow border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-l-md"
                  />
                  <button
                    onClick={() => copyToClipboard(`https://certifi.example/verify/${credentialHash}`)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-r-md"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="btn btn-outline w-full flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                  Facebook
                </button>

                <button className="btn btn-outline w-full flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter
                </button>
              </div>

              <button className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Share via Email
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full mr-4">
          <XCircleIcon className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">Verification Failed</h2>
      </div>

      <div className="mb-8">
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          We could not verify this certificate. This may be because:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
          <li>The certificate ID or QR code is incorrect</li>
          <li>The certificate has been revoked by the issuing institution</li>
          <li>The certificate has expired</li>
          <li>The certificate was not issued through the Certifi platform</li>
        </ul>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                If you believe this is a genuine certificate, please contact the issuing institution directly to confirm
                its authenticity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <button onClick={onReset} className="btn btn-outline gap-2">
          <ArrowPathIcon className="h-4 w-4" />
          Try Again
        </button>

        <a href="/contact" className="btn btn-primary gap-2">
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default CredentialVerifier;
