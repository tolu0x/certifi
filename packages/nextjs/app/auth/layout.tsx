"use client";

import { PropsWithChildren } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            CERTIFI
          </Link>

          <div className="flex space-x-6">
            <Link href="/auth/institution" className="hover:underline">
              Institutions
            </Link>
            <Link href="/auth/student" className="hover:underline">
              Students
            </Link>
          </div>
        </div>
      </header>

      <main className="py-12">{children}</main>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Certifi. All rights reserved.</p>
          <p className="mt-2">A blockchain-based certification verification platform.</p>
        </div>
      </footer>
    </div>
  );
}
