"use client";

import { base, baseSepolia } from "@privy-io/chains";
import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        defaultChain: baseSepolia,
        embeddedWallets: {
          showWalletUIs: false,
        },
        supportedChains: [base, baseSepolia],
      }}
    >
      <SmartWalletsProvider
        config={{
          paymasterContext: {
            mode: "SPONSORED",
            calculateGasLimits: true,
            expiryDuration: 300,
            sponsorshipInfo: {
              webhookData: {},
              smartAccountInfo: {
                name: "SAFE",
                version: "1.4.1",
              },
            },
          },
        }}
      >
        {children}
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
