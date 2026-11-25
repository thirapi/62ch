"use client";

import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { startNavigationProgress } from "@/components/navigation-progress";

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

  return (
    <div className="flex items-center gap-0.5 bg-muted/50 p-0.5 rounded-sm border border-muted h-8">
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="icon"
        className="h-full w-7 rounded-sm"
        onClick={() => setView("list")}
        title="Mode Daftar"
      >
        <List className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant={view === "catalog" ? "secondary" : "ghost"}
        size="icon"
        className="h-full w-7 rounded-sm"
        onClick={() => setView("catalog")}
        title="Mode Katalog"
      >
        <Grid className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
