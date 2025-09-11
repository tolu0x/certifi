"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "@privy-io/chains";

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            config={{
                defaultChain: base,
                embeddedWallets: {
                    createOnLogin: "users-without-wallets",
                    showWalletUIs: false,
                },
                supportedChains: [base],
            }}
        >
            {children}
        </PrivyProvider>
    );
}