"use client";

import { RoleGuard } from "../_components/RoleGuard";

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["institution"]} redirectTo="/auth/institution">
      {children}
    </RoleGuard>
  );
}
