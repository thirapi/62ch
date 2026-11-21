"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThreadListItem } from "@/components/thread-list-item";
import { CatalogView } from "@/components/catalog-view";

interface BoardBodyProps {
  threads: any[];
  boardCode: string;
  query: string;
  form: ReactNode;
  toolbar: ReactNode;
  footer: ReactNode;
}

/**
 * List vs catalog is only a different layout of the same threads, so the view
 * is read on the client: toggling it never round-trips to the server.
 */
export function BoardBody({ threads, boardCode, query, form, toolbar, footer }: BoardBodyProps) {
  const isCatalog = useSearchParams().get("view") === "catalog";

  return (
    <main
      className={cn(
        "mx-auto pb-2 flex-1 w-full max-w-none",
        isCatalog ? "px-6 md:px-12 lg:px-20" : "px-3 sm:px-4 md:px-8",
      )}
    >
      {form}

      <div className="pt-0">
        {toolbar}

        {isCatalog ? (
          <CatalogView threads={threads} boardCode={boardCode} />
        ) : (
          <div className="divide-y divide-ib-hr">
            {threads.map((thread) => (
              <ThreadListItem key={thread.id} thread={thread} boardCode={boardCode} />
            ))}

            {threads.length === 0 && (
              <div className="py-20 text-center text-muted-foreground italic">
                {query
                  ? `Tidak ada thread yang cocok dengan pencarian "${query}".`
                  : "Belum ada thread. Jadilah yang pertama memulai diskusi!"}
              </div>
            )}
          </div>
        )}

        {footer}
      </div>
    </main>
  );
}
