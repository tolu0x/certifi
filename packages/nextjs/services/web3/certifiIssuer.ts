import { useState } from "react";
import { IPFSService } from "../ipfs/ipfsService";
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
  certificateURI?: string; // IPFS URI to the certificate file
};

export const generateCredentialHash = (data: CertificateData) => {
  const credentialString = `${data.certificateTitle}:${data.recipientName}:${data.recipientId}:${data.issueDate}`;

  return keccak256(toUtf8Bytes(credentialString));
};

export const uploadMetadataToIPFS = async (metadata: CertificateMetadata): Promise<string> => {
  try {
    const ipfsService = IPFSService.getInstance();

    const metadataURI = await ipfsService.uploadMetadata(metadata);

    return metadataURI;
  } catch (error) {
    console.error("Failed to upload metadata to IPFS", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};

export const useCertifiIssuer = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { writeContractAsync: issueCredential, isPending: isIssuing } = useScaffoldWriteContract({
    contractName: "Certifi",
  });

  const issueCertificate = async (
    certificateData: CertificateData,
    recipientAddress: string,
    institutionName: string,
    institutionAddress: string,
    documentHash: string | null,
    certificateFile?: File,
  ) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      const ipfsService = IPFSService.getInstance();

      let certificateURI = "";
      if (certificateFile) {
        try {
          console.log("Uploading certificate file to IPFS...");
          certificateURI = await ipfsService.uploadFile(certificateFile);
          console.log("Certificate file uploaded:", certificateURI);
        } catch (error) {
          console.error("Error uploading certificate file:", error);
          setUploadError("Failed to upload certificate file");
          setIsUploading(false);
          throw new Error("Failed to upload certificate file");
        }
      }

      const metadata: CertificateMetadata = {
        title: certificateData.certificateTitle,
        description: certificateData.certificateCourse,
        issueDate: certificateData.issueDate,
        institution: {
          name: institutionName,
          address: institutionAddress,
        },
        recipient: {
          name: certificateData.recipientName,
          email: certificateData.recipientEmail,
          id: certificateData.recipientId,
        },
        ...(certificateURI && { certificateURI }),
      };

      console.log("Uploading metadata to IPFS...");
      const metadataURI = await uploadMetadataToIPFS(metadata);
      console.log("Metadata uploaded:", metadataURI);

      const credentialHash = generateCredentialHash(certificateData);

      const tx = await issueCredential({
        functionName: "issueCredential",
        args: [credentialHash, 0, metadataURI, documentHash],
      });

      setIsUploading(false);

      return {
        transactionHash: tx,
        credentialHash,
        metadataURI,
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
