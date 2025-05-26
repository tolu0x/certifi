"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSync } from "~~/hooks/useAuthSync";
import { useAuthStore } from "~~/services/store/authStore";

export default function InstitutionProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUserProfile } = useAuthStore();
  useAuthSync();

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    contactEmail: "",
    institutionType: "University",
    description: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    logoUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "institution") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        website: user.profileData?.website || "",
        contactEmail: user.profileData?.contactEmail || user.email || "",
        institutionType: user.profileData?.institutionType || "University",
        description: user.profileData?.description || "",
        address: user.profileData?.address || "",
        city: user.profileData?.city || "",
        country: user.profileData?.country || "",
        phone: user.profileData?.phone || "",
        logoUrl: user.profileData?.logoURL || "",
      });

      if (user.profileData?.logoURL) {
        setLogoPreview(user.profileData.logoURL);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      setTimeout(() => {
        updateUserProfile({
          name: formData.name,
          email: formData.contactEmail,
          profileData: {
            ...user?.profileData,
            website: formData.website,
            contactEmail: formData.contactEmail,
            institutionType: formData.institutionType,
            description: formData.description,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            phone: formData.phone,
            logoURL: logoPreview || user?.profileData?.logoURL,
          },
        });

        setIsEditing(false);
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || user?.role !== "institution") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/institution/dashboard" className="btn btn-ghost btn-sm gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
              <span className="text-gray-500 dark:text-gray-400">/</span>
              <h1 className="text-xl md:text-2xl font-bold">Institution Profile</h1>
            </div>

            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button form="profile-form" type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!user.profileData?.isApproved && (
            <div className="mb-8 p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Institution Verification Pending</h3>
                  <p className="mt-1 text-yellow-700 dark:text-yellow-400">
                    Your institution is currently under review. You&apos;ll be able to issue certificates once your
                    institution is approved. This process typically takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form id="profile-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4 flex items-center justify-center">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      )}
                    </div>

                    {isEditing && (
                      <div className="text-center">
                        <input type="file" id="logo" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        <label htmlFor="logo" className="btn btn-sm btn-outline">
                          {logoPreview ? "Change Logo" : "Upload Logo"}
                        </label>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoPreview(null);
                              setLogoFile(null);
                            }}
                            className="block mx-auto mt-2 text-xs text-red-600 dark:text-red-400"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Wallet Address</h3>
                    <p className="font-mono text-sm break-all">{user.address}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Verification Status</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${user.profileData?.isApproved ? "bg-green-500" : "bg-yellow-500"}`}
                      ></div>
                      <span>{user.profileData?.isApproved ? "Verified" : "Pending Verification"}</span>
                    </div>
                  </div>

                  {user.profileData?.approvalDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Verified On</h3>
                      <p>{new Date(user.profileData.approvalDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Profile Information */}
              <div className="md:col-span-2">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-6">Institution Information</h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="name">
                          Institution Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                            required
                          />
                        ) : (
                          <p>{formData.name || "Not provided"}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="institutionType">
                          Institution Type
                        </label>
                        {isEditing ? (
                          <select
                            id="institutionType"
                            name="institutionType"
                            value={formData.institutionType}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                            required
                          >
                            <option value="University">University</option>
                            <option value="College">College</option>
                            <option value="Training Center">Training Center</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <p>{formData.institutionType}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="description">
                        Description
                      </label>
                      {isEditing ? (
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                        />
                      ) : (
                        <p>{formData.description || "No description provided."}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="website">
                          Website
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                            required
                          />
                        ) : (
                          <p>
                            {formData.website ? (
                              <a
                                href={formData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {formData.website}
                              </a>
                            ) : (
                              "Not provided"
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="contactEmail">
                          Contact Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                            required
                          />
                        ) : (
                          <p>{formData.contactEmail || "Not provided"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mt-10 mb-6">Contact Information</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="address">
                        Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                        />
                      ) : (
                        <p>{formData.address || "Not provided"}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="city">
                          City
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          />
                        ) : (
                          <p>{formData.city || "Not provided"}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="country">
                          Country
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                          />
                        ) : (
                          <p>{formData.country || "Not provided"}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="phone">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                        />
                      ) : (
                        <p>{formData.phone || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
