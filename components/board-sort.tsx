"use client";

import { startNavigationProgress } from "@/components/navigation-progress";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Loader2 } from "lucide-react";
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
    <div className="flex items-center">
      <Select value={shownSort} onValueChange={setSort}>
        <SelectTrigger className="h-8 border border-muted bg-muted/20 hover:bg-muted/50 transition-colors focus:ring-1 focus:ring-ring shadow-sm font-medium w-auto min-w-[92px] sm:min-w-[112px] px-2 text-xs rounded-sm">
          <div className="flex items-center gap-1.5">
            {isPending ? (
              <Loader2 className="h-3 w-3 opacity-70 animate-spin" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-70" />
            )}
            <SelectValue placeholder="Urutan" />
          </div>
        </SelectTrigger>
        <SelectContent className="font-mono text-xs">
          <SelectItem value="bump">Aktif</SelectItem>
          <SelectItem value="new">Baru</SelectItem>
          {/* We can add more options here when backend supports them */}
          {/* <SelectItem value="replies">Paling Ramai</SelectItem> */}
        </SelectContent>
      </Select>
    </div>
  );
}
