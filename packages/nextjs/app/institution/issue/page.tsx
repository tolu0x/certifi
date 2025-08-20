"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { uploadToIPFS } from "~~/utils/ipfs";

interface CertificateFormData {
  studentAddress: string;
  studentId: string;
  course: string;
  grade: string;
  issueDate: string;
  description: string;
  certificateFile: File | null;
}

export default function IssueCertificate() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<CertificateFormData>({
    studentAddress: "",
    studentId: "",
    course: "",
    grade: "",
    issueDate: new Date().toISOString().split("T")[0],
    description: "",
    certificateFile: null,
  });

  const { writeContractAsync: issueCertificate } = useScaffoldWriteContract({
    contractName: "Certifi",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, certificateFile: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.certificateFile) {
      alert("Please upload a certificate file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload certificate file to IPFS
      const certificateIpfsHash = await uploadToIPFS(formData.certificateFile);

      // Create metadata
      const metadata = {
        name: `${formData.course} Certificate`,
        description: formData.description,
        image: `ipfs://${certificateIpfsHash}`,
        attributes: {
          studentId: formData.studentId,
          course: formData.course,
          grade: formData.grade,
          issueDate: formData.issueDate,
          issuer: session?.user?.name || "Unknown Institution",
        },
      };

      // Upload metadata to IPFS
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
      const metadataIpfsHash = await uploadToIPFS(metadataBlob);

      // Issue certificate on blockchain
      await issueCertificate({
        args: [
          formData.studentAddress,
          metadataIpfsHash,
          "ACADEMIC",
          Math.floor(new Date(formData.issueDate).getTime() / 1000),
        ],
      });

      router.push("/institution/dashboard");
    } catch (error) {
      console.error("Error issuing certificate:", error);
      alert("Failed to issue certificate. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Issue New Certificate</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="studentAddress">
              Student Wallet Address
            </label>
            <input
              type="text"
              id="studentAddress"
              name="studentAddress"
              value={formData.studentAddress}
              onChange={handleChange}
              className="w-full input input-bordered"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="studentId">
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full input input-bordered"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="course">
              Course
            </label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full input input-bordered"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="grade">
              Grade
            </label>
            <input
              type="text"
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full input input-bordered"
              required
            />
          </div>

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
              className="w-full input input-bordered"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full textarea textarea-bordered"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="certificateFile">
              Certificate File (PDF/Image)
            </label>
            <input
              type="file"
              id="certificateFile"
              name="certificateFile"
              onChange={handleFileChange}
              className="w-full file:input file:input-bordered"
              accept=".pdf,.png,.jpg,.jpeg"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isUploading}>
            {isUploading ? "Issuing Certificate..." : "Issue Certificate"}
          </button>
        </form>
      </div>
    </div>
  );
}
