"use client";

import { useEffect, useState } from "react";
import { useDemo } from "./_components/DemoProvider";
import { StepType, TourProvider, useTour } from "@reactour/tour";

const steps: StepType[] = [
  {
    selector: ".demo-dashboard",
    content: "Welcome to the demo dashboard! Here you can view your academic records and manage your credentials.",
  },
  {
    selector: ".demo-upload",
    content: "Upload new academic records and certificates here. In demo mode, this action is simulated.",
  },
  {
    selector: ".demo-verify",
    content: "Verify the authenticity of academic records. Try it out with our demo records!",
  },
  {
    selector: ".demo-records",
    content: "View your academic records and certificates. These are demo records for demonstration purposes.",
  },
];

function DemoContent() {
  const { currentUser, mockTranscripts, mockVerifications } = useDemo();
  const { setIsOpen } = useTour();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [verifyId, setVerifyId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<null | { valid: boolean; message: string }>(null);

  useEffect(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadSuccess(false);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsUploading(false);
    setUploadSuccess(true);

    setTimeout(() => {
      setUploadSuccess(false);
    }, 3000);
  };

  const handleVerify = async () => {
    if (!verifyId) return;

    setIsVerifying(true);
    setVerifyResult(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const isValid = verifyId === "transcript-1";
    setVerifyResult({
      valid: isValid,
      message: isValid
        ? "This record is verified and authentic."
        : "This record could not be verified. Please check the ID and try again.",
    });

    setIsVerifying(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Demo Academic Records System</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Experience how our platform works with simulated data and actions.
          </p>
          <button onClick={() => setIsOpen(true)} className="btn btn-primary px-6 py-2">
            Start Walkthrough
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="demo-dashboard p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {currentUser.image && (
                    <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="demo-upload p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Records</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Drag and drop your academic records here, or click to browse
                </p>
                <button onClick={handleUpload} disabled={isUploading} className="btn btn-outline w-full">
                  {isUploading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "Upload New Record"
                  )}
                </button>
              </div>
              {uploadSuccess && (
                <div className="alert alert-success">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Record uploaded successfully!</span>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                In demo mode, this action is simulated. No actual files will be uploaded.
              </p>
            </div>
          </div>

          <div className="demo-verify p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Verify Records</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Record ID</span>
                </label>
                <input
                  type="text"
                  value={verifyId}
                  onChange={e => setVerifyId(e.target.value)}
                  placeholder="Enter record ID to verify"
                  className="input input-bordered w-full"
                />
                <label className="label">
                  <span className="label-text-alt">Try using "transcript-1" for a successful verification</span>
                </label>
              </div>
              <button onClick={handleVerify} disabled={isVerifying || !verifyId} className="btn btn-outline w-full">
                {isVerifying ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Record"
                )}
              </button>
              {verifyResult && (
                <div className={`alert ${verifyResult.valid ? "alert-success" : "alert-error"}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    {verifyResult.valid ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                  <span>{verifyResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Records Section */}
          <div className="demo-records p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Records</h2>
            <div className="space-y-4">
              {mockTranscripts.map(transcript => (
                <div key={transcript.id} className="p-4 bg-base-200 rounded-lg">
                  <h3 className="font-medium">{transcript.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transcript.institution} • {transcript.date}
                  </p>
                  <div className="mt-2">
                    <span className="badge badge-success">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <TourProvider
      steps={steps}
      styles={{
        popover: base => ({
          ...base,
          backgroundColor: "white",
          color: "black",
          borderRadius: "0.5rem",
          padding: "1rem",
          paddingTop: "2rem",
          height: "10rem",
        }),
        badge: base => ({
          ...base,
          backgroundColor: "black",
        }),
      }}
    >
      <DemoContent />
    </TourProvider>
  );
}
