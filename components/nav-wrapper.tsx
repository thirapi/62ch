"use client";

import { useNav } from "./nav-provider";
import { cn } from "@/lib/utils";

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const { position } = useNav();

  return (
    <nav
      className={cn(
        "border-b bg-muted/30 px-2 sm:px-4 py-1 text-[11px] font-mono transition-all duration-300 overflow-x-hidden",
        position === "sticky"
          ? "sticky top-0 z-[100] backdrop-blur-md bg-muted/80"
          : "static",
      )}
    >
      {children}
    </nav>
  );
}
