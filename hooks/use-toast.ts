"use client";

import { toast as sonner } from "sonner";

// Compatibility shim: the app used two toast systems (Radix Toast + Sonner).
// Everything now renders through Sonner; this keeps the old
// `toast({ title, description, variant })` call shape working.

type ToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function toast({ title, description, variant }: ToastInput) {
  const show = variant === "destructive" ? sonner.error : sonner;
  return show(title ?? description ?? "", title ? { description } : undefined);
}

function useToast() {
  return { toast };
}

export { useToast, toast };
