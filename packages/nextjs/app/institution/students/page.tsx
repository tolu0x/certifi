"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "~~/lib/trpc/client";

interface Student {
  id: string;
  studentId: string | null;
  walletAddress: string | null;
  email: string;
  fullName: string;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: students, isLoading } = trpc.institutions.getStudents.useQuery();

  useEffect(() => {
    if (status === "unauthenticated" || session?.user?.role !== "institution") {
      router.push("/auth/institution");
      return;
    }

    if (!session.user.profileData?.isApproved) {
      router.push("/institution/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (students) {
      let filtered = [...students];

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(
          student =>
            student.fullName.toLowerCase().includes(search) ||
            student.email.toLowerCase().includes(search) ||
            student.studentId?.toLowerCase().includes(search),
        );
      }

      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "institution") {
    return null;
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
              <h1 className="text-xl md:text-2xl font-bold">Student Management</h1>
            </div>

            <button className="btn btn-primary btn-sm">Add New Student</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <h2 className="text-xl font-bold">Student Records</h2>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:max-w-md">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-md"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 border border-gray-200 dark:border-gray-800 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No students found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search or filter criteria."
                : "Start by adding a new student to your records."}
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-left py-3 px-4 font-medium">Student</th>
                    <th className="text-left py-3 px-4 font-medium">Student ID</th>
                    <th className="text-left py-3 px-4 font-medium">Enrollment Date</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{student.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm">{student.studentId}</span>
                      </td>
                      <td className="py-4 px-4">{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewStudent(student)} className="btn btn-sm btn-outline">
                            View
                          </button>
                          <button className="btn btn-sm btn-outline">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-base-100 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Student Details</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Full Name:</span>
                      <p>{selectedStudent.fullName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <p>{selectedStudent.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Student ID:</span>
                      <p className="font-mono">{selectedStudent.studentId}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Enrollment Information</h3>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Enrollment Date:</span>
                      <p>{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <button className="btn btn-outline">Edit Student</button>
                  <button className="btn btn-outline">View Certificates</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
