"use client";

import { DemoProvider } from "./_components/DemoProvider";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <div className="min-h-screen">
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 py-2 px-4 text-center">
          Demo Mode: All actions are simulated.
        </div>
        {children}
      </div>
    </DemoProvider>
  );
}
