"use client";

import { useParams } from "next/navigation";

/**
 * Classic loading state, after 5chan: no grey skeleton blocks, just a dim
 * "Memuat…" line with a small stepped spinner where the content will appear.
 * It fades in after a short delay (see .ib-loading in globals.css), so fast
 * navigations only show the top progress bar and never flash.
 */
export function LoadingLine({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="ib-loading flex items-center gap-1.5 py-6 text-sm text-muted-foreground">
      <span className="ib-spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

/**
 * Same banner box as the real board/thread pages so nothing jumps when content
 * arrives. loading.tsx gets no data, so only the board code (from the URL) is
 * shown, not the board name.
 */
function BannerPlaceholder() {
  const params = useParams<{ board?: string }>();
  return (
    <header className="py-3 sm:py-5 px-3 sm:px-4 text-center border-b border-ib-hr mb-1 sm:mb-3 flex flex-col items-center">
      <div className="ib-board-title text-2xl sm:text-[28px] max-w-3xl">
        {params.board ? `/${params.board}/` : " "}
      </div>
    </header>
  );
}

export function ThreadListSkeleton() {
  return <LoadingLine label="Memuat thread…" />;
}

export function BoardPageSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <BannerPlaceholder />
      <div className="px-3 sm:px-4 md:px-8 w-full">
        <LoadingLine label="Memuat board…" />
      </div>
    </div>
  );
}

export function ThreadPageSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BannerPlaceholder />
      <main className="mx-auto px-3 sm:px-4 md:px-8 py-2 sm:py-3 w-full max-w-none">
        <LoadingLine label="Memuat thread…" />
      </main>
    </div>
  );
}
