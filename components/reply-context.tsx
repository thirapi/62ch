"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useDefaultPassword } from "@/hooks/use-default-password";

interface ReplyState {
  author: string;
  deletionPassword: string;
  content: string;
  imageFile: File | null;
  isNsfw: boolean;
  isSpoiler: boolean;
  isSage: boolean;
}

interface ReplyContextType {
  state: ReplyState;
  setAuthor: React.Dispatch<React.SetStateAction<string>>;
  setDeletionPassword: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  setIsNsfw: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSpoiler: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSage: React.Dispatch<React.SetStateAction<boolean>>;
  resetForm: () => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

const DRAFT_SAVE_DELAY_MS = 400;

export function ReplyProvider({
  children,
  draftKey,
}: {
  children: React.ReactNode;
  /** When set, the reply text is saved to localStorage under this key and restored on reload. */
  draftKey?: string;
}) {
  const [author, setAuthorState] = useState("");
  const [deletionPassword, setDeletionPasswordState] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isNsfw, setIsNsfw] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSage, setIsSage] = useState(false);
  const [savedPassword, setSavedPassword] = useDefaultPassword();
  const draftLoadedRef = useRef(false);

  // Load persistent fields from localStorage
  useEffect(() => {
    const savedAuthor = localStorage.getItem("ib-author");
    if (savedAuthor) setAuthorState(savedAuthor);
  }, []);

  // Restore an unsent draft for this thread
  useEffect(() => {
    if (!draftKey) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) setContent((prev) => prev || saved);
    } catch {
      // storage unavailable — drafts are best-effort
    }
    draftLoadedRef.current = true;
  }, [draftKey]);

  // Persist the draft (debounced) while the user types
  useEffect(() => {
    if (!draftKey || !draftLoadedRef.current) return;
    const timer = setTimeout(() => {
      try {
        if (content.trim()) localStorage.setItem(draftKey, content);
        else localStorage.removeItem(draftKey);
      } catch {
        // ignore quota / privacy-mode errors
      }
    }, DRAFT_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [content, draftKey]);

  // Sync auto-generated default password into form state
  useEffect(() => {
    if (savedPassword) {
      setDeletionPasswordState(savedPassword);
    }
  }, [savedPassword]);

  const setAuthor: React.Dispatch<React.SetStateAction<string>> = (val) => {
    setAuthorState((prev) => {
      const newVal = typeof val === "function" ? val(prev) : val;
      localStorage.setItem("ib-author", newVal);
      return newVal;
    });
  };

  const setDeletionPassword: React.Dispatch<React.SetStateAction<string>> = (
    val,
  ) => {
    setDeletionPasswordState((prev) => {
      const newVal = typeof val === "function" ? val(prev) : val;
      setSavedPassword(newVal);
      return newVal;
    });
  };

  const resetForm = () => {
    if (draftKey) {
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
    }
    setContent("");
    setImageFile(null);
    setIsNsfw(false);
    setIsSpoiler(false);
    setIsSage(false);
  };

  return (
    <ReplyContext.Provider
      value={{
        state: {
          author,
          deletionPassword,
          content,
          imageFile,
          isNsfw,
          isSpoiler,
          isSage,
        },
        setAuthor,
        setDeletionPassword,
        setContent,
        setImageFile,
        setIsNsfw,
        setIsSpoiler,
        setIsSage,
        resetForm,
      }}
    >
      {children}
    </ReplyContext.Provider>
  );
}

export function useReply() {
  const context = useContext(ReplyContext);
  if (context === undefined) {
    throw new Error("useReply must be used within a ReplyProvider");
  }
  return context;
}
