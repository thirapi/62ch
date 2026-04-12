"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export function BoardSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "bump";

  const setSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "bump") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    // Reset to page 1 when sorting changes
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center">
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="h-8 border border-muted bg-muted/20 hover:bg-muted/50 transition-colors focus:ring-1 focus:ring-ring shadow-sm font-medium w-[90px] sm:w-[110px] text-xs rounded-sm">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3 w-3 opacity-70" />
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
