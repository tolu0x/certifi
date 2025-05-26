"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSync } from "~~/hooks/useAuthSync";
import { useAuthStore } from "~~/services/store/authStore";

export default function InstitutionOnboarding() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuthStore();
  const { isWalletConnected } = useAuthSync();

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    contactEmail: "",
    institutionType: "University",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or not an institution
  if (!isWalletConnected || !user || user.role !== "institution") {
    router.push("/auth/institution");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update user profile with institution details
      updateUserProfile({
        name: formData.name,
        email: formData.contactEmail,
        profileData: {
          website: formData.website,
          contactEmail: formData.contactEmail,
          institutionType: formData.institutionType,
          isApproved: false, // New institutions start as unapproved
        },
      });

      // In a real app, you would send this data to your backend/smart contract
      // For now, we'll just redirect to the dashboard
      router.push("/institution/dashboard");
    } catch (error) {
      console.error("Error submitting institution details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Complete Your Institution Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Provide details about your institution to complete the registration process.
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="name">
                Institution Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="website">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the official website of your institution
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="contactEmail">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="institutionType">
                Institution Type
              </label>
              <select
                id="institutionType"
                name="institutionType"
                value={formData.institutionType}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                required
              >
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="Training Center">Training Center</option>
                <option value="Corporate">Corporate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Complete Registration"}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Your institution will need to be verified before you can issue certificates. This typically takes 1-2
              business days.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
