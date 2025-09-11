import { useState } from "react";
import { encodeFunctionData } from "viem";
import { certifiAbi } from "~~/contracts/certifiAbi";
import { useAbstractJSMEE } from "./biconomyConfig";
import { base } from "viem/chains";

export const useCertifiIssuer = () => {
  const [isIssuing, setIsIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    meeClient,
    nexusAccount,
    authorization,
    isAuthorized,
    isInitializing,
    signEIP7702Authorization,
  } = useAbstractJSMEE();

  const issueCertificate = async (documentHash: string | null) => {
    if (!documentHash) {
      setError("Document hash is required");
      return;
    }

    if (!meeClient || !nexusAccount) {
      setError("MEE client not initialized");
      return;
    }

    try {
      setIsIssuing(true);
      setError(null);

      // Ensure EIP-7702 authorization is signed
      let currentAuthorization = authorization;
      if (!isAuthorized) {
        console.log("Signing EIP-7702 authorization...");
        currentAuthorization = await signEIP7702Authorization();
      }

      // Build the instruction for issuing certificate
      const instruction = await nexusAccount.buildComposable({
        type: "default",
        data: {
          abi: certifiAbi,
          functionName: "issueCredential",
          chainId: base.id,
          to: process.env.NEXT_PUBLIC_CERTIFI_CONTRACT_ADDRESS as `0x${string}`,
          args: [documentHash as `0x${string}`],
        },
      });

      // Execute gasless transaction
      const { hash } = await meeClient.execute({
        // Must pass authorization and set delegate to true for EIP-7702
        authorization: currentAuthorization,
        delegate: true,

        // Optional: Use gas token (comment out for ETH gas)
        // feeToken: {
        //   address: USDC_ADDRESS,
        //   chainId: base.id,
        // },
        
        instructions: [instruction],
      });

      console.log("Submitted tx hash:", hash);

      // Wait for transaction receipt
      const receipt = await meeClient.waitForSupertransactionReceipt({ hash });
      console.log("Tx complete:", receipt.hash);

      setIsIssuing(false);

      return {
        transactionHash: receipt.hash,
        credentialHash: documentHash,
        metadataURI: "",
        supertransactionHash: hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("Error issuing certificate:", error);
      setError("Failed to issue certificate");
      setIsIssuing(false);
      throw error;
    }
  };

  return {
    issueCertificate,
    isIssuing,
    error,
    isAuthorized,
    isInitializing,
    meeReady: !!(meeClient && nexusAccount),
  };
};