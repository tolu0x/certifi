"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "~~/types/auth";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * A component that guards routes based on user roles
 */
export const RoleGuard = ({ allowedRoles, redirectTo = "/", children }: RoleGuardProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [status, redirectTo, router]);

  // Show loading indicator during auth check
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Check if user is authorized to access this route
  const isAuthorized =
    status === "authenticated" && session?.user?.role && allowedRoles.includes(session.user.role as UserRole);

  // Only render children if user is authorized
  return isAuthorized ? <>{children}</> : null;
};
