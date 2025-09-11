export type UserRole = "student" | "institution" | "verifier";

export interface User {
  id?: string;
  role?: UserRole;
  name?: string;
  email?: string;
  onboardingCompleted?: boolean;
  profileData?: {
    website?: string;
    logoURL?: string;
    isApproved?: boolean;
    approvalDate?: string;
    contactEmail?: string;
    institutionType?: string;
    dateOfBirth?: string;
    profilePicture?: string;
    description?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
  };
}