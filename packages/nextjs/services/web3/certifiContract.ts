import { useEffect, useState } from "react";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export type CredentialVerificationResult = {
  isValid: boolean;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  metadataURI: string;
  credentialHash: string;
};

export const useCertifiContract = () => {
  // Get contract instance
  const { data: certifiContract } = useScaffoldContract({
    contractName: "Certifi",
  });

  return {
    certifiContract,
  };
};

export const useVerifyCredential = (credentialHash: string | null) => {
  const { certifiContract } = useCertifiContract();
  const [result, setResult] = useState<CredentialVerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: verificationData,
    isLoading: isVerificationLoading,
    error: verificationError,
  } = useScaffoldReadContract({
    contractName: "Certifi",
    functionName: "verifyCredential",
    args: credentialHash ? [credentialHash] : undefined,
    // enabled: !!credentialHash,
  });

  useEffect(() => {
    if (credentialHash === null) {
      setResult(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);

    if (verificationError) {
      setError(verificationError.message || "Failed to verify credential");
      setIsLoading(false);
      return;
    }

    if (!isVerificationLoading && verificationData) {
      try {
        const [isValid, issuer, issueDateRaw, expiryDateRaw, metadataURI] = verificationData;

        // Convert timestamp to Date objects
        const issueDate = new Date(Number(issueDateRaw) * 1000);
        let expiryDate: Date | undefined = undefined;

        if (Number(expiryDateRaw) > 0) {
          expiryDate = new Date(Number(expiryDateRaw) * 1000);
        }

        setResult({
          isValid,
          issuer,
          issueDate,
          expiryDate,
          metadataURI,
          credentialHash,
        });
        setIsLoading(false);
      } catch (e) {
        setError("Failed to parse verification data");
        setIsLoading(false);
      }
    }
  }, [credentialHash, verificationData, isVerificationLoading, verificationError]);

  return {
    result,
    isLoading,
    error,
  };
};

export const useVerifyCredentialWithSignature = () => {
  const { certifiContract } = useCertifiContract();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyWithSignature = async (credentialHash: string, signature: string, issuer: string): Promise<boolean> => {
    if (!certifiContract) {
      setError("Contract not initialized");
      return false;
    }

    try {
      setIsLoading(true);
      const result = await certifiContract.read.verifyCredentialWithSignature([credentialHash, signature, issuer]);
      setIsLoading(false);
      return result as boolean;
    } catch (e) {
      setError("Failed to verify credential with signature");
      setIsLoading(false);
      return false;
    }
  };

  return {
    verifyWithSignature,
    isLoading,
    error,
  };
};

export const useGetCredentialMetadata = () => {
  const fetchMetadata = async (metadataURI: string) => {
    try {
      // Handle IPFS URIs
      if (metadataURI.startsWith("ipfs://")) {
        const ipfsHash = metadataURI.replace("ipfs://", "");
        const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
        return await response.json();
      }

      // Regular HTTP URIs
      const response = await fetch(metadataURI);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
      return null;
    }
  };

  return {
    fetchMetadata,
  };
};
