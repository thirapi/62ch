import { notFound } from "next/navigation";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { ThreadForm } from "@/components/thread-form";
import { BoardSearch } from "@/components/board-search";
import { BoardSort } from "@/components/board-sort";
import { BoardViewToggle } from "@/components/board-view-toggle";
import { BoardBody } from "@/components/board-body";
import { Suspense } from "react";
import { ThreadListSkeleton } from "@/components/page-skeletons";

// Menggunakan Action layer sesuai Clean Architecture
import { getAuthUserCached, getBoardByCodeCached } from "@/lib/data/request-cache";
import { getThreadList } from "@/lib/actions/thread.actions";

/** Threads per page in list view (classic boards use 15). */
const THREADS_PER_PAGE = 15;
/** Catalog shows the whole board on one page (boards are capped at 128 threads). */
const CATALOG_LIMIT = 150;

async function BoardContent({
  boardCode,
  query,
  page,
  sort,
  view,
}: {
  boardCode: string;
  query: string;
  page: string;
  sort: string;
  view: string;
}) {
  const validSorts = ["bump", "new", "replies", "images"];
  const sortBy = validSorts.includes(sort) ? (sort as "bump" | "new" | "replies" | "images") : "bump";

  const isCatalog = view === "catalog";
  const currentPage = isCatalog ? 1 : Math.max(1, Number.parseInt(page) || 1);
  const limit = isCatalog ? CATALOG_LIMIT : THREADS_PER_PAGE;
  const offset = (currentPage - 1) * limit;

  // Parallelize board fetch and potential auth check
  const [board, user] = await Promise.all([
    getBoardByCodeCached(boardCode),
    getAuthUserCached()
  ]);

  if (!board) {
    notFound();
  }

  // Sort, search and paging span the whole board, so they run in the database.
  // List view: one page with reply previews. Catalog: every thread, no previews.
  const { threads, totalPages } = await getThreadList(
    board.id,
    limit,
    offset,
    sortBy,
    query || undefined,
    !isCatalog,
  );

  return (
    <BoardBody
      threads={threads || []}
      boardCode={boardCode}
      query={query}
      form={
        <div className="flex flex-col items-center mb-1 sm:mb-4">
          <div className="w-full max-w-2xl">
            <ThreadForm
              boardId={board.id}
              boardCode={board.code}
              userRole={user?.role}
            />
          </div>
        </div>
      }
      toolbar={
        <div className="flex flex-col gap-2 mb-4 py-2 border-y font-mono text-xs w-full sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:flex-1">
            <BoardSearch />
          </div>
          <div className="flex items-center justify-between gap-2 shrink-0 sm:justify-end">
            <BoardSort />
            <BoardViewToggle />
          </div>
        </div>
      }
      footer={
        <div className="mt-8">
          <Pagination
            totalPages={isCatalog ? 1 : totalPages}
            currentPage={currentPage}
            baseUrl={`/${boardCode}`}
          />
        </div>
      }
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board: boardCode } = await params;
  const board = await getBoardByCodeCached(boardCode);

  if (!board) {
    return { title: "Board Not Found" };
  }

  return {
    title: `/${board.code}/ - ${board.name}`,
    description: board.description || `Papan /${board.code}/ - ${board.name} di 62chan.`,
  };
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{
    view?: string;
    q?: string;
    page?: string;
    sort?: string;
  }>;
}) {
  const [{ board: boardCode }, {
    q: query = "",
    page = "1",
    sort = "bump",
    view = "list",
  }] = await Promise.all([params, searchParams]);

  const board = await getBoardByCodeCached(boardCode);

  if (!board) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="py-5 sm:py-10 px-3 sm:px-4 text-center border-b mb-1 sm:mb-4 flex flex-col items-center bg-muted/5">
        <h1 className="text-3xl sm:text-3xl lg:text-4xl font-bold text-accent tracking-tight">
          /{board.code}/
        </h1>
        <p className="text-base sm:text-lg font-semibold text-foreground max-w-2xl line-clamp-2 mt-1">
          {board.name}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground italic max-w-2xl line-clamp-2 mt-2">
          {board.description}
        </p>
      </header>

      <Suspense fallback={<div className="px-3 sm:px-4 md:px-8 w-full"><ThreadListSkeleton /></div>}>
        <BoardContent 
          boardCode={boardCode}
          query={query}
          page={page}
          sort={sort}
          view={view}
        />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
