import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import NextAuthProvider from "~~/components/NextAuthProvider";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
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
          <NextAuthProvider>
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default CertifiApp;
