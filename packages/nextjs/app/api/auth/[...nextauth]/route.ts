import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
      privyId?: string;
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
    privyId?: string;
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
        role: { label: "Role", type: "text" },
        privyId: { label: "Privy ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.address) {
          return null;
        }

        return {
          id: credentials.address,
          role: credentials.role as UserRole,
          address: credentials.address,
          name: `Institution ${credentials.address.substring(0, 6)}...${credentials.address.substring(credentials.address.length - 4)}`,
          profileData: {
            isApproved: true,
          },
          privyId: credentials.privyId,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3 * 24 * 60 * 60, // 3 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "student";
        token.address = user.address;
        token.name = user.name;
        token.image = user.image;
        token.profileData = user.profileData || { isApproved: true };
        token.privyId = user.privyId;
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
        session.user.privyId = token.privyId as string;
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
