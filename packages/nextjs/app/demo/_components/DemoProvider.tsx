"use client";

import React, { createContext, useContext, useState } from "react";
import { UserRole } from "~~/types/auth";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

interface DemoContextType {
  demoMode: boolean;
  currentUser: DemoUser;
  mockTranscripts: any[];
  mockVerifications: any[];
  setCurrentUser: (user: DemoUser) => void;
}

const defaultUser: DemoUser = {
  id: "demo-1",
  name: "Demo Student",
  email: "demo@example.com",
  role: "student",
  image: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser>(defaultUser);
  const [demoMode] = useState(true);

  // Mock data
  const mockTranscripts = [
    {
      id: "transcript-1",
      title: "Bachelor of Science in Computer Science",
      institution: "Demo University",
      date: "2023-05-15",
      status: "verified",
      courses: [
        { name: "Introduction to Programming", grade: "A", credits: 3 },
        { name: "Data Structures", grade: "A-", credits: 3 },
        { name: "Algorithms", grade: "B+", credits: 3 },
      ],
    },
  ];

  const mockVerifications = [
    {
      id: "verify-1",
      transcriptId: "transcript-1",
      verifiedBy: "Demo Employer",
      date: "2023-06-01",
      status: "verified",
    },
  ];

  return (
    <DemoContext.Provider
      value={{
        demoMode,
        currentUser,
        mockTranscripts,
        mockVerifications,
        setCurrentUser,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
};
