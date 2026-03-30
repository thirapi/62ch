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
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground whitespace-nowrap hidden sm:inline">Urutkan:</span>
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="h-9 bg-muted/50 border-none shadow-none focus:ring-0 font-medium">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
            <SelectValue placeholder="Pilih urutan" />
          </div>
        </SelectTrigger>
        <SelectContent className="font-mono text-xs">
          <SelectItem value="bump">Aktif (Bump)</SelectItem>
          <SelectItem value="new">Terbaru</SelectItem>
          {/* We can add more options here when backend supports them */}
          {/* <SelectItem value="replies">Paling Ramai</SelectItem> */}
        </SelectContent>
      </Select>
    </div>
  );
}
