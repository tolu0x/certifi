import NextAuth from "next-auth";
import { DefaultSession, DefaultUser, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { recoverMessageAddress } from "viem";
import { UserRole } from "~~/types/auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: UserRole;
      address?: string;
      name?: string;
      image?: string;
      profileData?: {
        isApproved: boolean;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role?: UserRole;
    address?: string;
    name?: string;
    image?: string;
    profileData?: {
      isApproved: boolean;
    };
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      id: "web3",
      name: "Web3",
      credentials: {
        address: { label: "Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature || !credentials?.message) {
          return null;
        }

        try {
          const recoveredAddress = await recoverMessageAddress({
            message: credentials.message,
            signature: credentials.signature as `0x${string}`,
          });

          if (recoveredAddress.toLowerCase() === credentials.address.toLowerCase()) {
            return {
              id: credentials.address,
              role: credentials.role as UserRole,
              address: credentials.address,
              name: `Institution ${credentials.address.substring(0, 6)}...${credentials.address.substring(credentials.address.length - 4)}`,
              profileData: {
                isApproved: true,
              },
            };
          }
          return null;
        } catch (error) {
          console.error("Error verifying signature:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3 * 24 * 60 * 60, // 3 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "student"; // Default to student role for Google OAuth
        token.address = user.address;
        token.name = user.name;
        token.image = user.image;
        token.profileData = user.profileData || { isApproved: true }; // Default to approved for Google OAuth
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.address = token.address as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.profileData = token.profileData as { isApproved: boolean };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/student",
    signOut: "/auth/student",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
