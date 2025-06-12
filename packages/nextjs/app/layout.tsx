import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import NextAuthProvider from "~~/components/NextAuthProvider";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { TRPCProvider } from "~~/lib/trpc/provider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Certifi - Blockchain Credential Verification",
  description: "A decentralized platform for issuing and verifying educational certificates and credentials.",
});

const CertifiApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <TRPCProvider>
            <NextAuthProvider>
              <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
            </NextAuthProvider>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default CertifiApp;
