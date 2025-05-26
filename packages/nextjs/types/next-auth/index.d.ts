import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      address?: string;
      name?: string;
      email?: string;
      profileData?: {
        isApproved: boolean;
      };
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role?: string;
    address?: string;
    name?: string;
    email?: string;
    profileData?: {
      isApproved: boolean;
    };
  }
}
