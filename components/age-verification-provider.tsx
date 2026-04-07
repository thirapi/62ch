"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AgeVerificationDialog } from "./age-verification-dialog";

const AGE_VERIFICATION_KEY = "imageboard_age_verified";

interface AgeVerificationContextType {
  isVerified: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  verify: () => void;
  onAccept: () => void;
  onDecline: () => void;
  setPendingPath: (path: string | null) => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

export function AgeVerificationProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Initialize verification state from localStorage
  useEffect(() => {
    const hasVerified = localStorage.getItem(AGE_VERIFICATION_KEY) === "true";
    setIsVerified(hasVerified);

    // If we are on a board page and not verified, show dialog
    const isBoardPath = pathname !== "/" && 
                       !pathname.startsWith("/rules") && 
                       !pathname.startsWith("/donasi") &&
                       !pathname.startsWith("/mod"); // Allow some pages

    if (isBoardPath && !hasVerified) {
      setIsOpen(true);
    }
  }, [pathname]);

  const verify = () => {
    localStorage.setItem(AGE_VERIFICATION_KEY, "true");
    setIsVerified(true);
    setIsOpen(false);
    
    if (pendingPath) {
      router.push(pendingPath);
      setPendingPath(null);
    }
  };

  const onAccept = () => {
    verify();
  };

  const onDecline = () => {
    setIsOpen(false);
    // If we are on a restricted path, move to homepage
    const isBoardPath = pathname !== "/" && 
                       !pathname.startsWith("/rules") && 
                       !pathname.startsWith("/donasi") &&
                       !pathname.startsWith("/mod");

    if (isBoardPath) {
      router.push("/");
    }
  };

  return (
    <AgeVerificationContext.Provider value={{ isVerified, isOpen, setIsOpen, verify, onAccept, onDecline, setPendingPath }}>
      {children}
      <AgeVerificationDialog />
    </AgeVerificationContext.Provider>
  );
}

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error("useAgeVerification must be used within an AgeVerificationProvider");
  }
  return context;
}
