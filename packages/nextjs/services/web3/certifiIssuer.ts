import { useState } from "react";
import { keccak256, toUtf8Bytes } from "ethers";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export type CertificateData = {
  recipientName: string;
  recipientEmail: string;
  recipientId: string;
  certificateTitle: string;
  certificateCourse: string;
  issueDate: string;
};

export type CertificateMetadata = {
  title: string;
  description: string;
  issueDate: string;
  institution: {
    name: string;
    address: string;
  };
  recipient: {
    name: string;
    email: string;
    id: string;
  };
};

export const useCertifiIssuer = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { writeContractAsync: issueCredential, isPending: isIssuing } = useScaffoldWriteContract({
    contractName: "Certifi",
  });

  const issueCertificate = async (
    // certificateData: CertificateData,
    // recipientAddress: string,
    // institutionName: string,
    // institutionAddress: string,
    documentHash: string | null,
  ) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const tx = await issueCredential({
        functionName: "issueCredential",
        args: [documentHash as `0x${string}`],
      });

      setIsUploading(false);

      return {
        transactionHash: tx,
        credentialHash: documentHash,
        metadataURI: "",
      };
    } catch (error) {
      console.error("Error issuing certificate:", error);
      setUploadError("Failed to issue certificate");
      setIsUploading(false);
      throw error;
    }
  };

  return {
    issueCertificate,
    isIssuing: isIssuing || isUploading,
    error: uploadError,
  };
};
