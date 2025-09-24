"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function VerifyHashFromQueryPage() {
  const params = useParams();
  const hash = typeof params.hash === "string" ? params.hash : Array.isArray(params.hash) ? params.hash[0] : undefined;

  const [studentId, setStudentId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    blockchainMatch: boolean | null;
  } | null>(null);

  const { data: contractData, refetch: refetchContract } = useScaffoldReadContract({
    contractName: "Certifi",
    functionName: "verifyCredential",
    args: [hash as `0x${string}` | undefined],
  });

  useEffect(() => {
    setVerificationResult(null);
  }, [hash, studentId]);

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value);
  };

  const handleVerify = async () => {
    if (!hash || !studentId) return;
    setIsVerifying(true);

    // Optionally, you can refetch contract data here if needed
    const { data: contractDataResult } = await refetchContract();
    const blockchainMatch = contractDataResult?.[3] === hash;

    setVerificationResult({ blockchainMatch });
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
              <label className="block text-sm font-medium mb-2" htmlFor="hash">
                Document Hash
              </label>
              <input
                type="text"
                id="hash"
                value={hash || ""}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 rounded-md text-gray-500"
              />
            </div>

            <button
              onClick={handleVerify}
              className="btn btn-primary"
              disabled={isVerifying || !hash || !studentId}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>

          {verificationResult && (
            <div className="mt-8">
              <h3 className="text-lg font-medium">Verification Results</h3>
              <div className="space-y-2">
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