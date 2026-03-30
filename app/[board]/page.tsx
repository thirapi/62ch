import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pin, Lock, MessageSquare } from "lucide-react";
import { ThreadForm } from "@/components/thread-form";
import { FormattedText } from "@/components/formatted-text";
import { BoardRepository } from "@/lib/repositories/board.repository";
import { ThreadRepository } from "@/lib/repositories/thread.repository";
import { ReplyRepository } from "@/lib/repositories/reply.repository";
import { GetThreadListUseCase } from "@/lib/use-cases/get-thread-list.use-case";
import { BoardViewToggle } from "@/components/board-view-toggle";
import { BoardSearch } from "@/components/board-search";
import { CatalogView } from "@/components/catalog-view";
import { cn } from "@/lib/utils";
import { FormattedDate } from "@/components/formatted-date";
import { ExpandableImage } from "@/components/expandable-image";
import { TripcodeDisplay } from "@/components/tripcode-display";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { SiteFooter } from "@/components/site-footer";
import { ThreadListItem } from "@/components/thread-list-item";

async function getAuthUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value || null;
  if (!sessionId) return null;
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) return null;
  return user;
}

export const revalidate = 60; // Cache halaman board selama 60 detik

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board: boardCode } = await params;
  const boardRepository = new BoardRepository();
  const board = await boardRepository.findByCode(boardCode);

  if (!board) {
    return {
      title: "Board Not Found",
    };
  }

  return {
    title: `/${board.code}/ - ${board.name}`,
    description:
      board.description ||
      `Papan /${board.code}/ - ${board.name} di 62chan. Tempat diskusi anonim mengenai ${board.name}.`,
    openGraph: {
      title: `/${board.code}/ - ${board.name} | 62chan`,
      description:
        board.description ||
        `Papan /${board.code}/ - ${board.name} di 62chan. Tempat diskusi anonim mengenai ${board.name}.`,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `/${board.code}/ - ${board.name} | 62chan`,
      description:
        board.description || `Papan /${board.code}/ - ${board.name} di 62chan.`,
      images: ["/opengraph-image"],
    },
    alternates: {
      canonical: `${(process.env.NEXT_PUBLIC_BASE_URL || "https://62chan.qzz.io").replace(/\/$/, "")}/${board.code}`,
    },
  };
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ view?: string; q?: string; page?: string }>;
}) {
  const { board: boardCode } = await params;
  const { view = "list", q: query = "", page = "1" } = await searchParams;

  const currentPage = Math.max(1, Number.parseInt(page) || 1);
  const limit = 50;
  const offset = (currentPage - 1) * limit;

  const boardRepository = new BoardRepository();
  const board = await boardRepository.findByCode(boardCode);

  if (!board) {
    notFound();
  }

  const threadRepository = new ThreadRepository();
  const getThreadListUseCase = new GetThreadListUseCase(threadRepository);

  const user = await getAuthUser();

  let { threads, totalPages } = await getThreadListUseCase.execute(
    board.id,
    limit,
    offset,
  );

  if (query) {
    const q = query.toLowerCase();
    // Note: Search filtering is currently done in memory.
    // Ideally this should be pushed to the repository level for proper pagination with search.
    // For now, we filter the fetched page, which might result in fewer than 'limit' items.
    threads = threads.filter(
      (t) =>
        t.subject?.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q),
    );
  }

  const isCatalog = view === "catalog";
 
  const CapcodeMarker = ({
    type,
    className,
  }: {
    type: string | null | undefined;
    className?: string;
  }) => {
    if (!type) return null;
    if (type === "mod" || type === "moderator") {
      return (
        <span
          className={cn(
            "text-purple-600 dark:text-purple-400 font-bold leading-none",
            className,
          )}
        >
          ## Mod
        </span>
      );
    }
    if (type === "admin") {
      return (
        <span
          className={cn(
            "text-red-600 dark:text-red-400 font-bold leading-none",
            className,
          )}
        >
          ## Admin
        </span>
      );
    }
    return null;
  };

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://62chan.qzz.io").replace(/\/$/, "");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `/${board.code}/ - ${board.name}`,
        "item": `${baseUrl}/${board.code}`
      }
    ],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/${board.code}`
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="py-6 px-4 text-center border-b mb-8 flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-accent mb-1 tracking-tight truncate max-w-full">
          /{board.code}/ - {board.name}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground italic mb-4 max-w-xl line-clamp-2">
          {board.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md sm:max-w-none justify-center">
          <BoardSearch />
          <BoardViewToggle />
        </div>
      </header>

      <main
        className={cn(
          "mx-auto pb-2 flex-1 w-full",
          isCatalog
            ? "px-6 md:px-12 lg:px-20 max-w-none"
            : "px-4 md:px-8 max-w-none",
        )}
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-full max-w-2xl">
            <ThreadForm 
              boardId={board.id} 
              boardCode={board.code} 
              userRole={user?.role}
            />
          </div>
        </div>

        <div className="border-t pt-4">
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

          {/* Pagination */}
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

      <SiteFooter />
    </div>
  );
}
