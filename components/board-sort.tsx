"use client";

import { startNavigationProgress } from "@/components/navigation-progress";
import { useRouter, useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";

export function BoardSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "bump";
  const [isPending, startTransition] = useTransition();
  // Show the picked option immediately while the server renders the new order
  const [shownSort, setShownSort] = useOptimistic(sort);

  const setSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "bump") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    // Reset to page 1 when sorting changes
    params.delete("page");
    const qs = params.toString();
    startNavigationProgress();
    startTransition(() => {
      setShownSort(newSort);
      router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    });
  };

  return (
    <label className="inline-flex items-center gap-1 text-muted-foreground whitespace-nowrap">
      Urutkan:
      <select
        value={shownSort}
        onChange={(e) => setSort(e.target.value)}
        aria-busy={isPending}
        className="h-6 rounded-none border border-border bg-background px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="bump">Aktif</option>
        <option value="new">Baru</option>
      </select>
      {isPending && <span className="opacity-70" aria-hidden>…</span>}
    </label>
  );
}
