"use client";

import { useState } from "react";
import Link from "next/link";
import CredentialVerifier, { VerificationMethod } from "../../components/verify/CredentialVerifier";
import {
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  QrCodeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function VerifyPage() {
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(null);

  // Reset verification flow
  const resetVerification = () => {
    setVerificationMethod(null);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-b from-base-200 to-base-100 dark:from-base-300 dark:to-base-100 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Certificate Verification</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Instantly verify the authenticity of academic and professional credentials using blockchain technology.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {!verificationMethod ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setVerificationMethod("id")}
                className="p-8 border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center hover:border-black dark:hover:border-white transition duration-200 rounded-lg"
              >
                <DocumentMagnifyingGlassIcon className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Certificate ID</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the unique certificate ID provided by the issuing institution.
                </p>
              </button>

              <button
                onClick={() => setVerificationMethod("qr")}
                className="p-8 border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center hover:border-black dark:hover:border-white transition duration-200 rounded-lg"
              >
                <QrCodeIcon className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">QR Code</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Scan or enter the verification code from the certificate&apos;s QR code.
                </p>
              </button>

              <button
                onClick={() => setVerificationMethod("file")}
                className="p-8 border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center hover:border-black dark:hover:border-white transition duration-200 rounded-lg"
              >
                <DocumentCheckIcon className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Certificate</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload the certificate PDF or image to verify its authenticity.
                </p>
              </button>
            </div>
          ) : (
            <CredentialVerifier verificationMethod={verificationMethod} onReset={resetVerification} />
          )}

          {/* Help Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center">How Verification Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-base-200 dark:bg-base-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Blockchain Security</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Each certificate is secured by blockchain technology, making it impossible to forge or tamper with.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-base-200 dark:bg-base-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCodeIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Verification</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Verify any certificate instantly using its unique ID or QR code, with no account required.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-base-200 dark:bg-base-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentCheckIcon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Cryptographic Proof</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Digital signatures ensure certificates come from legitimate institutions and haven&apos;t been
                  altered.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg inline-block">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you a student looking to access your certificates?
              </p>
              <Link href="/auth/student" className="btn btn-outline">
                Student Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
