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
    } else if (
      status === "authenticated" &&
      session?.user?.role &&
      !allowedRoles.includes(session.user.role as UserRole)
    ) {
      router.push(redirectTo);
    }
  }, [status, session, redirectTo, router, allowedRoles]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const isAuthorized =
    status === "authenticated" && session?.user?.role && allowedRoles.includes(session.user.role as UserRole);

  return isAuthorized ? <>{children}</> : null;
};
