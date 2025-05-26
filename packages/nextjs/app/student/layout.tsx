"use client";

import { RoleGuard } from "../_components/RoleGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["student"]} redirectTo="/auth/student">
      {children}
    </RoleGuard>
  );
}
