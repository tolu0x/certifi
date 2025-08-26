"use client";

import { ChangeEvent, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { trpc } from "~~/lib/trpc/client";

export default function VerifyHashPage() {
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState("");
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    dbMatch: boolean | null;
    blockchainMatch: boolean | null;
  } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleStudentIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value);
  };

  // const getCertificate = trpc.certificates.getCertificateByStudentId.useQuery(
  //   { studentId },
  //   { enabled: false },
  // );

  const [documentHash, setDocumentHash] = useState<string | undefined>(undefined);

  const { data: contractData, refetch: refetchContract } = useScaffoldReadContract({
    contractName: "Certifi",
    functionName: "verifyCredential",
    args: [documentHash as `0x${string}` | undefined],
  });

  const handleVerify = async () => {
    if (!certificateFile || !studentId) {
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    const reader = new FileReader();
    reader.onload = async event => {
      if (event.target?.result) {
        const buffer = event.target.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        setCalculatedHash(hashHex);
        setDocumentHash(hashHex);

        // const { data: certificateData } = await getCertificate.refetch();

        if (true) {
          // const dbMatch = certificateData.documentHash === hashHex;
          const dbMatch = false;

          const { data: contractData } = await refetchContract();
          console.log("contract data", contractData);

          const blockchainMatch = contractData?.[3] === hashHex;

          setVerificationResult({ dbMatch, blockchainMatch });
        } else {
          setVerificationResult({ dbMatch: false, blockchainMatch: false });
        }
      }
    };

    reader.readAsArrayBuffer(certificateFile);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-base-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold">Verify Document Hash</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="studentId">
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={handleStudentIdChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                placeholder="Enter student ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="certificateFile">
                Certificate Document (PDF)
              </label>
              <input
                type="file"
                id="certificateFile"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
              />
            </div>

            <button
              onClick={handleVerify}
              className="btn btn-primary"
              disabled={isVerifying || !certificateFile || !studentId}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>

          {calculatedHash && (
            <div className="mt-8">
              <h3 className="text-lg font-medium">Calculated Hash</h3>
              <p className="font-mono text-sm">{calculatedHash}</p>
            </div>
          )}

          {verificationResult && (
            <div className="mt-8">
              <h3 className="text-lg font-medium">Verification Results</h3>
              <div className="space-y-2">
                {/* <div>
                  <span className="font-medium">Database Match:</span>
                  <span className={`ml-2 ${verificationResult.dbMatch ? 'text-green-500' : 'text-red-500'}`}>
                    {verificationResult.dbMatch ? "Verified" : "Not Verified"}
                  </span>
                </div> */}
                <div>
                  <span className="font-medium">Blockchain Match:</span>
                  <span className={`ml-2 ${verificationResult.blockchainMatch ? "text-green-500" : "text-red-500"}`}>
                    {verificationResult.blockchainMatch ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
