"use client";

import { startNavigationProgress } from "@/components/navigation-progress";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function BoardViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const view = searchParams.get("view") || "list";

  const setView = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "list") {
      params.delete("view");
    } else {
      params.set("view", newView);
    }
    params.delete("page");
    const qs = params.toString();
    // List and catalog load different data (one page with reply previews vs
    // the whole board), so this is a real navigation.
    startNavigationProgress();
    startTransition(() => {
      router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    });
  };

  const item = (key: "list" | "catalog", label: string) => (
    <button
      type="button"
      onClick={() => setView(key)}
      aria-pressed={view === key}
      className={
        view === key
          ? "font-bold text-foreground cursor-default"
          : "text-accent hover:underline cursor-pointer"
      }
    >
      [{label}]
    </button>
  );

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      {item("list", "List")}
      {item("catalog", "Katalog")}
    </div>
  );
}
