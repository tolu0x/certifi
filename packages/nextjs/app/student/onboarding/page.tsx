"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "~~/lib/trpc/client";
import { notification } from "~~/utils/scaffold-eth";

export default function StudentOnboarding() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    studentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: userCheckData,
    isLoading: isCheckingUser,
    error: userCheckError,
  } = trpc.students.checkUser.useQuery(undefined, {
    enabled: status === "authenticated",
    retry: false,
  });

  const createOrUpdate = trpc.students.createOrUpdate.useMutation();

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Unauthenticated, redirecting to login from onboarding");
      router.push("/auth/student");
    }

    if (!isCheckingUser && userCheckData?.exists && userCheckData.user?.id) {
      router.push("/student/dashboard");
    } else {
      notification.error("User not found!");
      router.push("/auth/student");
    }
  }, [status, router, isCheckingUser, userCheckData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createOrUpdate.mutateAsync({
        studentId: formData.studentId,
      });
      router.refresh();
    } catch (error) {
      notification.error("Error completing profile");
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Complete Your Student Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a few additional details to help us connect your certificates to your account.
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center gap-4 mb-8 p-4 bg-base-200 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <Image
                  width={24}
                  height={24}
                  priority
                  src={session.user.image}
                  alt={session.user.name || ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium">{session?.user?.name || "Demo User"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email || "demo@example.com"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="studentId">
                Student ID / Registration Number
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter your student ID or registration number"
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This helps match your certificates to your institutional records
              </p>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Complete Profile"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By completing your profile, you agree to our{" "}
                <Link href="/terms" className="underline hover:no-underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:no-underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
