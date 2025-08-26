"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { sha256 } from "viem";
import { z } from "zod";
import { trpc } from "~~/lib/trpc/client";
import { useCertifiIssuer } from "~~/services/web3/certifiIssuer";

const studentIdSchema = z.object({
  studentId: z.string().min(9, "Student ID must be 9 characters").max(9, "Student ID must be 9 characters"),
  certificateTitle: z.string().min(1, "Certificate title cannot be empty"),
  certificateCourse: z.string().min(1, "Course cannot be empty"),
});

type StudentIdFormData = z.infer<typeof studentIdSchema>;

export default function IssueCertificatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { issueCertificate, isIssuing } = useCertifiIssuer();
  const createCertificate = trpc.certificates.create.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StudentIdFormData>({
    resolver: zodResolver(studentIdSchema),
  });

  const studentId = watch("studentId");
  const certificateTitle = watch("certificateTitle");
  const certificateCourse = watch("certificateCourse");

  const { data: studentData, isLoading: isLoadingStudent } = trpc.students.getByStudentId.useQuery(
    { studentId },
    {
      enabled: studentId?.length === 9,
    },
  );

  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientId: "",
    certificateTitle: "",
    certificateCourse: "",
    issueDate: new Date().toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [documentHash, setDocumentHash] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean;
    step: "file" | "metadata" | "blockchain" | null;
    progress: number;
  }>({
    isUploading: false,
    step: null,
    progress: 0,
  });

  useEffect(() => {
    if (certificateFile) {
      const reader = new FileReader();
      reader.onload = async event => {
        if (event.target?.result) {
          const buffer = event.target.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
          setDocumentHash(hashHex);
        }
      };
      reader.readAsArrayBuffer(certificateFile);
    }
  }, [certificateFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCertificateFile(e.target.files[0]);
    }
  };

  if (status === "unauthenticated" || session?.user?.role !== "institution") {
    router.replace("/auth/institution");
    return null;
  }

  if (!session.user.profileData?.isApproved) {
    console.log("unauthorized");
    router.push("/institution/dashboard");
    return null;
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1 && studentData) {
      setFormData(prev => ({
        ...prev,
        recipientName: studentData.fullName || "",
        recipientEmail: studentData.email || "",
        recipientId: studentData.studentId || "",
      }));
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleSubmitDetails = handleSubmit(async (data: StudentIdFormData) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);
    setFormError(null);

    try {
      const mockRecipientAddress = `0x${Math.random().toString(36).substring(2, 10)}${"0".repeat(34)}`;
      const institutionName = session.user.name || "LASU";
      const institutionAddress = session.user.address || "0x0000000000000000000000000000000000000000";

      // 1. Issue on blockchain
      const result = await issueCertificate(documentHash);

      // 2. Issue in DB
      await createCertificate.mutateAsync({
        studentId: studentData?.id || formData.recipientId || "",
        institution: institutionName,
        degree: formData.certificateTitle,
        fieldOfStudy: formData.certificateCourse,
        issueDate: formData.issueDate,
        documentHash: documentHash || undefined,
      });

      console.log("Certificate issued successfully:", result);
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
  });

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
          <div className="flex items-center justify-between max-w-xl mx-auto px-4">
            <div
              className={`flex flex-col items-center ${currentStep >= 1 ? "text-black dark:text-white" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep >= 1 ? "bg-black dark:bg-white text-white dark:text-black" : "bg-gray-200 dark:bg-gray-700 text-gray-600"}`}
              >
                1
              </div>
              <span className="text-sm">Details</span>
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
              <span className="text-sm">Review</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
          {/* Step 1: Certificate Details */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Certificate Details</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Recipient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="studentId">
                        Student ID
                      </label>
                      <input
                        type="text"
                        id="studentId"
                        {...register("studentId")}
                        className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                        placeholder="Enter 9-digit student ID"
                      />
                      {errors.studentId && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.studentId.message}</p>
                      )}
                    </div>
                  </div>

                  {isLoadingStudent && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Looking up student details...</span>
                    </div>
                  )}

                  {studentData && (
                    <div className="mt-6 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <h4 className="font-medium mb-3">Student Details</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                          <p>{studentData.fullName}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                          <p>{studentData.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Student ID:</span>
                          <p>{studentData.studentId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isLoadingStudent && studentId?.length === 9 && !studentData && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-yellow-700 dark:text-yellow-400">No student found with this ID.</p>
                    </div>
                  )}
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
                        {...register("certificateTitle")} // Use register instead of manual handling
                        placeholder="e.g., Bachelor of Education"
                        className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                        onChange={e => {
                          handleChange(e); // Keep the existing handler for formData sync
                        }}
                      />
                      {errors.certificateTitle && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.certificateTitle.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="certificateCourse">
                        Course of study
                      </label>
                      <input
                        type="text"
                        id="certificateCourse"
                        {...register("certificateCourse")} // Use register instead of manual handling
                        placeholder="e.g Computer Science"
                        className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                        onChange={e => {
                          handleChange(e); // Keep the existing handler for formData sync
                        }}
                      />
                      {errors.certificateCourse && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.certificateCourse.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="certificateFile">
                        Certificate Document (PDF)
                      </label>
                      <input
                        type="file"
                        id="certificateFile"
                        name="certificateFile"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                      />
                    </div>
                    {documentHash && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Document Hash (SHA-256):</p>
                        <p className="font-mono text-sm">{documentHash}</p>
                      </div>
                    )}

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
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button type="button" onClick={handlePreviousStep} className="btn btn-outline">
                  Back
                </button>
                <button type="button" onClick={handleNextStep} className="btn btn-primary" disabled={!studentData}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review and Submit */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmitDetails}>
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
                        <h1 className="text-3xl font-serif font-bold mb-2">
                          {session.user.name || "Institution Name"}
                        </h1>
                        <p className="text-lg">Certificate of Achievement</p>
                      </div>

                      <p className="mb-6 text-lg">This certifies that</p>
                      <p className="text-2xl font-bold mb-6">{formData.recipientName}</p>
                      <p className="mb-6 text-lg">has successfully completed</p>
                      <p className="text-2xl font-bold mb-6">{certificateTitle || formData.certificateTitle}</p>
                      <p className="mb-12 text-lg">{certificateCourse || formData.certificateCourse}</p>

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
                              <p>{certificateTitle || formData.certificateTitle}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Issue Date:</span>
                              <p>{new Date(formData.issueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Course</h4>
                        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                          <p>{certificateCourse || formData.certificateCourse}</p>
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
                        Once issued, this certificate will be uploaded to IPFS for permanent storage and recorded in the
                        database. If you upload a certificate file, it will be stored on IPFS along with the certificate
                        metadata. The recipient will be notified via email once the certificate is issued.
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
                </div>

                {/* Upload Progress Indicator */}
                {uploadStatus.isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>
                        {uploadStatus.step === "file"
                          ? "Uploading Certificate File to IPFS"
                          : uploadStatus.step === "metadata"
                            ? "Uploading Certificate Metadata to IPFS"
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
                          uploadStatus.step === "file"
                            ? "text-blue-600 dark:text-blue-400 font-medium"
                            : uploadStatus.step === "metadata" || uploadStatus.step === "blockchain"
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : ""
                        }
                      >
                        Certificate Upload
                      </span>
                      <span>→</span>
                      <span
                        className={
                          uploadStatus.step === "metadata"
                            ? "text-blue-600 dark:text-blue-400 font-medium"
                            : uploadStatus.step === "blockchain"
                              ? "text-green-600 dark:text-green-400 font-medium"
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
                        Database Record
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
