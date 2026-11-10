import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { SiteFooter } from "@/components/site-footer";
import { ThreadListItem } from "@/components/thread-list-item";
import { AdBanner } from "@/components/ad-banner";
import { ThreadForm } from "@/components/thread-form";
import { BoardSearch } from "@/components/board-search";
import { BoardSort } from "@/components/board-sort";
import { BoardViewToggle } from "@/components/board-view-toggle";
import { CatalogView } from "@/components/catalog-view";
import { Suspense } from "react";
import { ThreadListSkeleton } from "@/components/page-skeletons";

// Menggunakan Action layer sesuai Clean Architecture
import { getBoardByCode } from "@/lib/actions/board.actions";
import { getThreadList } from "@/lib/actions/thread.actions";

async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value || null;
    if (!sessionId) return null;
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) return null;
    return user;
  } catch (e) {
    return null;
  }
}

async function BoardContent({
  boardCode,
  view,
  query,
  page,
  sort,
}: {
  boardCode: string;
  view: string;
  query: string;
  page: string;
  sort: string;
}) {
  const validSorts = ["bump", "new", "replies", "images"];
  const sortBy = validSorts.includes(sort) ? (sort as "bump" | "new" | "replies" | "images") : "bump";

  const currentPage = Math.max(1, Number.parseInt(page) || 1);
  const limit = 50;
  const offset = (currentPage - 1) * limit;

  // Parallelize board fetch and potential auth check
  const [board, user] = await Promise.all([
    getBoardByCode(boardCode),
    getAuthUser()
  ]);

  if (!board) {
    notFound();
  }

  // Memanggil Action untuk mengambil data thread
  let { threads, totalPages } = await getThreadList(
    board.id,
    limit,
    offset,
    sortBy,
  );

  if (query) {
    const q = query.toLowerCase();
    threads = threads.filter(
      (t) =>
        t.subject?.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q),
    );
  }

  const isCatalog = view === "catalog";

  return (
    <main
      className={cn(
        "mx-auto pb-2 flex-1 w-full",
        isCatalog
          ? "px-6 md:px-12 lg:px-20 max-w-none"
          : "px-3 sm:px-4 md:px-8 max-w-none",
      )}
    >
      <div className="flex flex-col items-center mb-1 sm:mb-4">
        <div className="w-full max-w-2xl">
          <ThreadForm
            boardId={board.id}
            boardCode={board.code}
            userRole={user?.role}
          />
        </div>
      </div>

      <div className="pt-0">
        <div className="flex flex-col gap-2 mb-4 py-2 border-y font-mono text-xs w-full sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:flex-1">
            <BoardSearch />
          </div>
          <div className="flex items-center justify-between gap-2 shrink-0 sm:justify-end">
            <Link
              href={`/${boardCode}/archive`}
              className="text-muted-foreground hover:text-accent hover:underline whitespace-nowrap"
              title="Thread yang sudah diarsipkan"
            >
              [Arsip]
            </Link>
            <BoardSort />
            <BoardViewToggle />
          </div>
        </div>

        {isCatalog ? (
          <CatalogView threads={threads || []} boardCode={boardCode} />
        ) : (
          <div className="divide-y divide-muted/30">
            {threads?.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                boardCode={boardCode}
              />
            ))}

            {threads?.length === 0 && (
              <div className="py-20 text-center text-muted-foreground italic">
                {query
                  ? `Tidak ada thread yang cocok dengan pencarian "${query}".`
                  : "Belum ada thread. Jadilah yang pertama memulai diskusi!"}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="mt-8">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              baseUrl={`/${boardCode}`}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board: boardCode } = await params;
  const board = await getBoardByCode(boardCode);

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
    view = "list",
    q: query = "",
    page = "1",
    sort = "bump",
  }] = await Promise.all([params, searchParams]);

  const board = await getBoardByCode(boardCode);

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

      <AdBanner />

      <Suspense fallback={<div className="px-3 sm:px-4 md:px-8 w-full"><ThreadListSkeleton /></div>}>
        <BoardContent 
          boardCode={boardCode}
          view={view}
          query={query}
          page={page}
          sort={sort}
        />
      </Suspense>

      <AdBanner />
      <SiteFooter />
    </div>
  );
}
