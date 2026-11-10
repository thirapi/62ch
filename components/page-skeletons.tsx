import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Neutral skeleton block — the default Skeleton uses the accent color, too loud for whole pages. */
function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-muted/60 rounded-sm", className)} />;
}

export function ThreadListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-muted/30" aria-busy="true" aria-label="Memuat thread">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-4 flex gap-3">
          <Bone className="h-[120px] w-[120px] sm:h-[150px] sm:w-[150px] shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="flex gap-2">
              <Bone className="h-4 w-40" />
              <Bone className="h-4 w-20" />
              <Bone className="h-4 w-24 hidden sm:block" />
            </div>
            <Bone className="h-3 w-full max-w-xl" />
            <Bone className="h-3 w-5/6 max-w-lg" />
            <Bone className="h-3 w-2/3 max-w-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BoardPageSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-5 sm:py-10 px-3 sm:px-4 border-b mb-1 sm:mb-4 flex flex-col items-center gap-2 bg-muted/5">
        <Bone className="h-9 w-24" />
        <Bone className="h-5 w-48" />
        <Bone className="h-3 w-64" />
      </header>
      <main className="px-3 sm:px-4 md:px-8 w-full">
        <div className="flex justify-center mb-4">
          <Bone className="h-6 w-40" />
        </div>
        <div className="flex items-center justify-between gap-2 py-2 mb-4 border-y">
          <Bone className="h-7 w-full max-w-xs" />
          <Bone className="h-7 w-32" />
        </div>
        <ThreadListSkeleton />
      </main>
    </div>
  );
}

export function ThreadPageSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Memuat thread">
      <header className="py-1.5 px-3 sm:px-4 border-b flex items-center justify-between bg-muted/5">
        <Bone className="h-4 w-40" />
        <Bone className="h-4 w-24" />
      </header>
      <main className="px-3 sm:px-4 md:px-8 py-4 sm:py-8">
        {/* OP */}
        <div className="flex gap-2 mb-2">
          <Bone className="h-4 w-48" />
          <Bone className="h-4 w-24" />
        </div>
        <div className="flex gap-4 mb-6">
          <Bone className="h-[200px] w-[200px] sm:h-[260px] sm:w-[260px] shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Bone className="h-3 w-full max-w-2xl" />
            <Bone className="h-3 w-5/6 max-w-xl" />
            <Bone className="h-3 w-3/4 max-w-lg" />
          </div>
        </div>
        {/* Replies */}
        <div className="space-y-2">
          {[64, 96, 56, 80].map((h, i) => (
            <div key={i} className="border border-muted/20 rounded-sm p-2 w-full max-w-2xl">
              <div className="flex gap-2 mb-2">
                <Bone className="h-3 w-24" />
                <Bone className="h-3 w-16" />
                <Bone className="h-3 w-20" />
              </div>
              <div className="space-y-1.5" style={{ minHeight: h - 24 }}>
                <Bone className="h-3 w-11/12" />
                <Bone className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function ArchivePageSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Memuat arsip">
      <header className="py-1.5 px-3 sm:px-4 border-b flex items-center justify-between bg-muted/5">
        <Bone className="h-4 w-40" />
        <Bone className="h-4 w-24" />
      </header>
      <main className="mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 sm:py-8">
        <Bone className="h-7 w-48 mb-2" />
        <Bone className="h-3 w-72 mb-5" />
        <div className="border border-muted/30 rounded-md divide-y divide-muted/20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-3 py-2.5">
              <Bone className="h-3 w-16" />
              <Bone className="h-3 flex-1 max-w-md" />
              <Bone className="h-3 w-10 ml-auto hidden sm:block" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
