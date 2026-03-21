import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pin, Lock, MessageSquare } from "lucide-react";
import { ThreadForm } from "@/components/thread-form";
import { FormattedText } from "@/components/formatted-text";
import { getThreadList } from "@/lib/actions/thread.actions";
import { getBoardByCode } from "@/lib/actions/board.actions";
import { BoardViewToggle } from "@/components/board-view-toggle";
import { BoardSearch } from "@/components/board-search";
import { CatalogView } from "@/components/catalog-view";
import { cn } from "@/lib/utils";
import { footerText } from "@/constants/footer";
import { FormattedDate } from "@/components/formatted-date";
import { ExpandableImage } from "@/components/expandable-image";
import { TripcodeDisplay } from "@/components/tripcode-display";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";

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
  const board = await getBoardByCode(boardCode);

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

  const board = await getBoardByCode(boardCode);

  if (!board) {
    notFound();
  }

  const user = await getAuthUser();

  let { threads, totalPages } = await getThreadList(board.id, limit, offset);

  if (query) {
    const q = query.toLowerCase();
    // Note: Search filtering is currently done in memory.
    // Ideally this should be pushed to the repository level for proper pagination with search.
    // For now, we filter the fetched page, which might result in fewer than 'limit' items.
    threads = threads.filter(
      (t: any) =>
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
          "mx-auto pb-20 flex-1 w-full",
          isCatalog
            ? "px-6 md:px-12 lg:px-20 max-w-none"
            : "px-4 md:px-8 max-w-6xl",
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

        <div className="border-t pt-8">
          {isCatalog ? (
            <CatalogView threads={threads || []} boardCode={boardCode} />
          ) : (
            <div className="divide-y divide-muted/30">
              {threads?.map((thread: any) => (
                <div key={thread.id} className="ib-post py-8 first:pt-0">
                  {/* Meta line */}
                  <div className="ib-post-metaline">
                    {thread.isPinned && (
                      <Pin className="h-3 w-3 text-accent fill-accent" />
                    )}
                    {thread.isLocked && (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                    {thread.subject && (
                      <span className="ib-subject">{thread.subject}</span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <TripcodeDisplay
                        author={thread.author || "Awanama"}
                        className="ib-author"
                        hideTrip={!!thread.capcode}
                      />
                      <CapcodeMarker type={thread.capcode} />
                    </div>
                    <span className="text-muted-foreground text-xs">
                      <FormattedDate date={thread.createdAt} />
                    </span>
                    <Link
                      href={`/${boardCode}/thread/${thread.id}`}
                      className="ib-post-number"
                    >
                      No.{thread.postNumber}
                    </Link>
                    <Link
                      href={`/${boardCode}/thread/${thread.id}`}
                      className="text-[11px] hover:underline flex items-center gap-1 text-muted-foreground ml-2"
                    >
                      [Balas]
                    </Link>
                  </div>

                  {/* Content area with classic layout for OP */}
                  <div className="mt-2 block overflow-hidden">
                    {thread.image && (
                      <ExpandableImage
                        src={thread.image}
                        alt="Thumbnail"
                        isNsfw={thread.isNsfw}
                        isSpoiler={thread.isSpoiler}
                        isOP={true}
                      />
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      <FormattedText content={thread.content} />
                    </div>

                    {thread.replyCount > (thread.replies?.length || 0) && (
                      <div className="mt-4 text-xs text-muted-foreground italic clear-both">
                        {thread.replyCount - (thread.replies?.length || 0)}{" "}
                        balasan diabaikan.
                        <Link
                          href={`/${boardCode}/thread/${thread.id}`}
                          className="text-accent hover:underline ml-1"
                        >
                          Klik di sini untuk melihat semua.
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Reply Previews */}
                  {thread.replies && thread.replies.length > 0 && (
                    <div className="mt-4 space-y-3 ml-4 sm:ml-12 max-w-5xl">
                      {thread.replies
                        .slice()
                        .reverse()
                        .slice(0, 3)
                        .reverse()
                        .map((reply: any) => (
                          <div
                            key={reply.id}
                            className="ib-reply shadow-sm border border-muted/20 w-fit max-w-full"
                          >
                            <div className="ib-post-metaline text-xs px-2 pt-1 border-b border-muted/5 bg-muted/5">
                              <div className="flex items-baseline gap-1">
                                <TripcodeDisplay
                                  author={reply.author || "Awanama"}
                                  className="ib-author"
                                  hideTrip={!!reply.capcode}
                                />
                                <CapcodeMarker type={reply.capcode} />
                              </div>
                              <span className="text-muted-foreground opacity-70">
                                <FormattedDate date={reply.createdAt} />
                              </span>
                              <span className="ib-post-number opacity-80">
                                No.{reply.postNumber}
                              </span>
                            </div>
                            <div className="p-2 block overflow-hidden">
                              {reply.image && (
                                <ExpandableImage
                                  src={reply.image}
                                  alt="Reply thumbnail"
                                  isNsfw={reply.isNsfw}
                                  isSpoiler={reply.isSpoiler}
                                />
                              )}
                              <div className="text-sm leading-snug">
                                <FormattedText content={reply.content} />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
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
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              baseUrl={`/${boardCode}`}
            />
          )}
        </div>
      </main>

      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>{footerText}</p>
        </div>
      </footer>
    </div>
  );
}
