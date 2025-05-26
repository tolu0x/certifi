"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSync } from "~~/hooks/useAuthSync";
import { useAuthStore } from "~~/services/store/authStore";
import { useCertifiIssuer } from "~~/services/web3/certifiIssuer";

export default function IssueCertificatePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  useAuthSync();

  const { issueCertificate, isIssuing } = useCertifiIssuer();

  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientId: "",
    certificateTitle: "",
    certificateDescription: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    templateId: "1",
  });

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean;
    step: "file" | "metadata" | "blockchain" | null;
    progress: number;
  }>({
    isUploading: false,
    step: null,
    progress: 0,
  });

  if (!isAuthenticated || user?.role !== "institution") {
    router.push("/admin");
    return null;
  }

  if (!user.profileData?.isApproved) {
    router.push("/institution/dashboard");
    return null;
  }

  const certificateTemplates = [
    { id: "1", name: "Academic Degree", description: "Standard academic degree certificate" },
    { id: "2", name: "Professional Course", description: "Certificate for professional course completion" },
    { id: "3", name: "Workshop", description: "Workshop or seminar attendance certificate" },
    { id: "4", name: "Custom", description: "Upload your own certificate template" },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Initialize upload status
    setUploadStatus({
      isUploading: true,
      step: certificateFile ? "file" : "metadata",
      progress: 0,
    });

    try {
      const mockRecipientAddress = `0x${Math.random().toString(36).substring(2, 10)}${"0".repeat(34)}`;

      const institutionName = user?.name || "Demo Institution";
      const institutionAddress = user?.address || "0x0000000000000000000000000000000000000000";

      if (certificateFile) {
        for (let i = 0; i <= 100; i += 10) {
          setUploadStatus(prev => ({
            ...prev,
            progress: i,
          }));
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      setUploadStatus({
        isUploading: true,
        step: "metadata",
        progress: 0,
      });

      // Simulate progress for metadata upload
      for (let i = 0; i <= 100; i += 20) {
        setUploadStatus(prev => ({
          ...prev,
          progress: i,
        }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setUploadStatus({
        isUploading: true,
        step: "blockchain",
        progress: 0,
      });

      const result = await issueCertificate(
        formData,
        mockRecipientAddress,
        institutionName,
        institutionAddress,
        certificateFile || undefined,
      );

      console.log("Certificate issued successfully:", result);

      setUploadStatus({
        isUploading: true,
        step: "blockchain",
        progress: 100,
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Store additional metadata in your database, send an email notification to the recipient, generate a QR code for the certificate

      router.push("/institution/certificates");
    } catch (error) {
      console.error("Error issuing certificate:", error);
      setFormError("Failed to issue certificate. Please try again.");
      setIsSubmitting(false);
      setUploadStatus({
        isUploading: false,
        step: null,
        progress: 0,
      });
    }
  };

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
              <h1 className="text-xl md:text-2xl font-bold">Issue New Certificate</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
            <div
              className={`flex flex-col items-center ${currentStep >= 1 ? "text-black dark:text-white" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep >= 1 ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-200 dark:bg-gray-700 text-gray-600"}`}
              >
                1
              </div>
              <span className="text-sm">Template</span>
            </div>

            <div
              className={`flex-1 h-0.5 ${currentStep >= 2 ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"}`}
            ></div>

            <div
              className={`flex flex-col items-center ${currentStep >= 2 ? "text-black dark:text-white" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep >= 2 ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-200 dark:bg-gray-700 text-gray-600"}`}
              >
                2
              </div>
              <span className="text-sm">Details</span>
            </div>

            <div
              className={`flex-1 h-0.5 ${currentStep >= 3 ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"}`}
            ></div>

            <div
              className={`flex flex-col items-center ${currentStep >= 3 ? "text-black dark:text-white" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep >= 3 ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-200 dark:bg-gray-700 text-gray-600"}`}
              >
                3
              </div>
              <span className="text-sm">Review</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Select Certificate Template</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {certificateTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.templateId === template.id
                          ? "border-black dark:border-white bg-gray-50 dark:bg-gray-900"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, templateId: template.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border ${
                            formData.templateId === template.id
                              ? "border-black dark:border-white bg-black dark:bg-white"
                              : "border-gray-400"
                          }`}
                        >
                          {formData.templateId === template.id && (
                            <div className="w-full h-full rounded-full bg-black dark:bg-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.templateId === "4" && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Upload Custom Certificate Template</label>
                    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      {certificateFile ? (
                        <div>
                          <p className="mb-2 text-sm">{certificateFile.name}</p>
                          <button
                            type="button"
                            onClick={() => setCertificateFile(null)}
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
                              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            PDF or image file (.pdf, .jpg, .png)
                          </p>
                          <input
                            type="file"
                            id="certificate-template"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="certificate-template"
                            className="mt-2 inline-block cursor-pointer btn btn-sm btn-outline"
                          >
                            Browse Files
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn btn-primary"
                    disabled={formData.templateId === "4" && !certificateFile}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Certificate Details */}
            {currentStep === 2 && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Certificate Details</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Recipient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="recipientName">
                          Recipient Full Name
                        </label>
                        <input
                          type="text"
                          id="recipientName"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="recipientEmail">
                          Recipient Email
                        </label>
                        <input
                          type="email"
                          id="recipientEmail"
                          name="recipientEmail"
                          value={formData.recipientEmail}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="recipientId">
                          Student ID / Registration Number
                        </label>
                        <input
                          type="text"
                          id="recipientId"
                          name="recipientId"
                          value={formData.recipientId}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Certificate Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="certificateTitle">
                          Certificate Title
                        </label>
                        <input
                          type="text"
                          id="certificateTitle"
                          name="certificateTitle"
                          value={formData.certificateTitle}
                          onChange={handleChange}
                          placeholder="e.g., Bachelor of Education"
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="certificateDescription">
                          Certificate Description
                        </label>
                        <textarea
                          id="certificateDescription"
                          name="certificateDescription"
                          value={formData.certificateDescription}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Describe what this certificate represents..."
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="issueDate">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            id="issueDate"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" htmlFor="expiryDate">
                            Expiry Date (Optional)
                          </label>
                          <input
                            type="date"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={handlePreviousStep} className="btn btn-outline">
                    Back
                  </button>
                  <button type="button" onClick={handleNextStep} className="btn btn-primary">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review and Submit */}
            {currentStep === 3 && (
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6">Review Certificate</h2>

                <div className="mb-8">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-medium">Certificate Preview</h3>
                    <button
                      type="button"
                      onClick={togglePreview}
                      className="text-sm text-gray-600 dark:text-gray-400 underline"
                    >
                      {previewMode ? "Hide Details" : "View Full Certificate"}
                    </button>
                  </div>

                  {previewMode ? (
                    <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-lg text-center">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                        <h1 className="text-3xl font-serif font-bold mb-2">{user?.name || "Institution Name"}</h1>
                        <p className="text-lg">Certificate of Achievement</p>
                      </div>

                      <p className="mb-6 text-lg">This certifies that</p>
                      <p className="text-2xl font-bold mb-6">{formData.recipientName}</p>
                      <p className="mb-6 text-lg">has successfully completed</p>
                      <p className="text-2xl font-bold mb-6">{formData.certificateTitle}</p>
                      <p className="mb-12 text-lg">{formData.certificateDescription}</p>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date of Issue</p>
                          <p>{new Date(formData.issueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <div className="w-24 h-12 border-b border-black dark:border-white mb-2"></div>
                          <p className="text-sm">Signature</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Certificate ID</p>
                          <p className="font-mono text-sm">
                            CERT-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Recipient Information</h4>
                          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                              <p>{formData.recipientName}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                              <p>{formData.recipientEmail}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">ID:</span>
                              <p>{formData.recipientId}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Certificate Information</h4>
                          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Title:</span>
                              <p>{formData.certificateTitle}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Issue Date:</span>
                              <p>{new Date(formData.issueDate).toLocaleDateString()}</p>
                            </div>
                            {formData.expiryDate && (
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Expiry Date:</span>
                                <p>{new Date(formData.expiryDate).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <p>{formData.certificateDescription}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Template</h4>
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <p>{certificateTemplates.find(t => t.id === formData.templateId)?.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">Important Information</h3>
                      <p className="mt-1 text-blue-700 dark:text-blue-400 text-sm">
                        Once issued, this certificate will be recorded on the blockchain and cannot be altered. The
                        recipient will be notified via email once the certificate is issued.
                      </p>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6 text-red-700 dark:text-red-400">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p>{formError}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={handlePreviousStep} className="btn btn-outline">
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || isIssuing}>
                    {isSubmitting || isIssuing ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        {uploadStatus.step === "file"
                          ? "Uploading Certificate..."
                          : uploadStatus.step === "metadata"
                            ? "Uploading Metadata..."
                            : uploadStatus.step === "blockchain"
                              ? "Creating Blockchain Record..."
                              : "Issuing Certificate..."}
                      </>
                    ) : (
                      "Issue Certificate"
                    )}
                  </button>

                  {/* Upload Progress Indicator */}
                  {uploadStatus.isUploading && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>
                          {uploadStatus.step === "file"
                            ? "Uploading Certificate File"
                            : uploadStatus.step === "metadata"
                              ? "Uploading Certificate Metadata"
                              : uploadStatus.step === "blockchain"
                                ? "Creating Blockchain Record"
                                : "Processing..."}
                        </span>
                        <span>{uploadStatus.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: `${uploadStatus.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 flex justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span
                          className={
                            uploadStatus.step === "file" ||
                            uploadStatus.step === "metadata" ||
                            uploadStatus.step === "blockchain"
                              ? "text-blue-600 dark:text-blue-400 font-medium"
                              : ""
                          }
                        >
                          IPFS Upload
                        </span>
                        <span>→</span>
                        <span
                          className={
                            uploadStatus.step === "metadata" || uploadStatus.step === "blockchain"
                              ? "text-blue-600 dark:text-blue-400 font-medium"
                              : ""
                          }
                        >
                          Metadata Storage
                        </span>
                        <span>→</span>
                        <span
                          className={
                            uploadStatus.step === "blockchain" ? "text-blue-600 dark:text-blue-400 font-medium" : ""
                          }
                        >
                          Blockchain Record
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
