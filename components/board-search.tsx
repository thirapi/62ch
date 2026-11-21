"use client";

import { startNavigationProgress } from "@/components/navigation-progress";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/use-debounce";

export function BoardSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const [value, setValue] = useState(currentQuery);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const queryInUrl = params.get("q") || "";

    if (debouncedValue === queryInUrl) return;

    // A new search always starts from the first page of results
    params.delete("page");
    if (debouncedValue) {
      params.set("q", debouncedValue);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    // replace, not push: typing shouldn't leave one history entry per query
    startNavigationProgress();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [debouncedValue, router, searchParams]);

  return (
    <label className="flex items-center gap-1 w-full sm:max-w-xs text-muted-foreground">
      <span className="whitespace-nowrap">Cari:</span>
      <span className="relative flex-1">
        <input
          type="search"
          placeholder="judul atau isi OP"
          className="h-6 w-full rounded-none border border-border bg-background px-1.5 pr-6 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-accent [&::-webkit-search-cancel-button]:hidden"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 px-0.5 hover:text-foreground"
            title="Hapus pencarian"
          >
            ×
          </button>
        )}
      </span>
    </label>
  );
}
