import {
  createWalletClient,
  http,
  custom,
  erc20Abi,
  createPublicClient,
} from "viem";
import { base, optimism } from "viem/chains";
import {
  createMeeClient,
  toMultichainNexusAccount,
  runtimeERC20BalanceOf,
  greaterThanOrEqualTo,
  getMEEVersion,
  MEEVersion
} from "@biconomy/abstractjs";
import { useWallets, useSignAuthorization } from "@privy-io/react-auth";
import { useState, useEffect } from "react";

// Constants
const NEXUS_IMPLEMENTATION = "0x000000004F43C49e93C970E84001853a70923B03";

export interface BiconomyMeeState {
  meeClient: any;
  nexusAccount: any;
  authorization: any;
  isAuthorized: boolean;
  isInitializing: boolean;
  error: string | null;
}

// Hook to manage AbstractJS MEE integration
export const useAbstractJSMEE = () => {
  const [state, setState] = useState<BiconomyMeeState>({
    meeClient: null,
    nexusAccount: null,
    authorization: null,
    isAuthorized: false,
    isInitializing: false,
    error: null,
  });

  const { wallets } = useWallets();
  const { signAuthorization } = useSignAuthorization();

  // Initialize MEE client and smart account
  const initializeMEE = async () => {
    try {
      setState(prev => ({ ...prev, isInitializing: true, error: null }));

      // Get embedded wallet
      const embeddedWallet = wallets?.[0];
      if (!embeddedWallet) {
        throw new Error("No embedded wallet found");
      }

      // Switch to Base chain
      await embeddedWallet.switchChain(base.id);
      const provider = await embeddedWallet.getEthereumProvider();

      // Create wallet client with proper account structure
      const walletClient = createWalletClient({
        chain: base,
        transport: custom(provider),
        account: embeddedWallet.address
      });

      // Create account object for the signer
      // const account = {
      //   address: embeddedWallet.address as `0x${string}`,
      //   type: "json-rpc" as const,
      // };

      // Create multichain smart account
      const nexusAccount = await toMultichainNexusAccount({
        chainConfigurations: [
          {
            chain: base,
            transport: http(),
            version: getMEEVersion(MEEVersion.V2_1_0)
          },
          {
            chain: optimism,
            transport: http(),
            version: getMEEVersion(MEEVersion.V2_1_0)
          }
        ],
        signer: walletClient,
        accountAddress: embeddedWallet.address as `0x${string}`,
      });

      // Create MEE client
      const meeClient = await createMeeClient({ account: nexusAccount });

      setState(prev => ({
        ...prev,
        meeClient,
        nexusAccount,
        isInitializing: false,
      }));

      return { meeClient, nexusAccount };
    } catch (error) {
      console.error("Error initializing MEE:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to initialize MEE",
        isInitializing: false,
      }));
      throw error;
    }
  };

  // Sign EIP-7702 authorization
  const signEIP7702Authorization = async () => {
    try {
      setState(prev => ({ ...prev, isInitializing: true, error: null }));

      const authorization = await signAuthorization({
        contractAddress: NEXUS_IMPLEMENTATION,
        chainId: 0, // Chain ID 0 for EIP-7702
      });

      setState(prev => ({
        ...prev,
        authorization,
        isAuthorized: true,
        isInitializing: false,
      }));

      return authorization;
    } catch (error) {
      console.error("Error signing EIP-7702 authorization:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to sign authorization",
        isInitializing: false,
      }));
      throw error;
    }
  };

  // Initialize when wallets are available
  useEffect(() => {
    if (wallets && wallets.length > 0 && !state.meeClient) {
      initializeMEE();
    }
  }, [wallets]);

  return {
    ...state,
    initializeMEE,
    signEIP7702Authorization,
  };
};
