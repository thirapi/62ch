import { notFound } from "next/navigation";
import Link from "next/link";
import { BoardRepository } from "@/lib/repositories/board.repository";
import { ThreadRepository } from "@/lib/repositories/thread.repository";
import { ReplyRepository } from "@/lib/repositories/reply.repository";
import { GetThreadDetailUseCase } from "@/lib/use-cases/get-thread-detail.use-case";
import ThreadPageWrapper from "./thread";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";
import { SiteFooter } from "@/components/site-footer";

async function getAuthUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value || null;
  if (!sessionId) return null;
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) return null;
  return user;
}

export const revalidate = 3600; // Cache selama 1 jam, akan di-update instan saat ada balasan baru via revalidatePath

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}): Promise<Metadata> {
  const { board: boardCode, id } = await params;
  const threadId = Number.parseInt(id);

  if (Number.isNaN(threadId)) {
    return {
      title: "Thread Not Found",
    };
  }

  const threadRepository = new ThreadRepository();
  const getThreadDetailUseCase = new GetThreadDetailUseCase(
    threadRepository,
    new ReplyRepository(),
  );

  const result = await getThreadDetailUseCase.execute(threadId);

  if (!result) {
    return {
      title: "Thread Not Found",
    };
  }

  const { thread } = result;
  const title =
    thread.subject ||
    thread.content.substring(0, 50).replace(/\n/g, " ") + "...";
  const cleanDescription = thread.content
    .substring(0, 160)
    .replace(/\n/g, " ")
    .replace(/>/g, "");

  return {
    title: `${title} - /${boardCode}/`,
    description: cleanDescription,
    openGraph: {
      title: `${title} | /${boardCode}/ | 62chan`,
      description: cleanDescription,
      images: thread.image ? [thread.image] : ["/opengraph-image"],
      type: "article",
    },
    twitter: {
      card: thread.image ? "summary_large_image" : "summary",
      title: `${title} | /${boardCode}/ | 62chan`,
      description: cleanDescription,
      images: thread.image ? [thread.image] : ["/opengraph-image"],
    },
  };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ board: string; id: string }>;
}) {
  const { board: boardCode, id } = await params;
  const threadId = Number.parseInt(id);

  if (Number.isNaN(threadId)) {
    notFound();
  }

  const threadRepository = new ThreadRepository();
  const replyRepository = new ReplyRepository();
  const getThreadDetailUseCase = new GetThreadDetailUseCase(
    threadRepository,
    replyRepository,
  );

  const user = await getAuthUser();
  const result = await getThreadDetailUseCase.execute(threadId, user);

  if (!result) {
    notFound();
  }

  const { thread, replies } = result;

  const boardRepository = new BoardRepository();
  const board = await boardRepository.findById(thread.boardId);

  if (!board || board.code !== boardCode) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-2 px-4 border-b flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 bg-muted/5">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-base font-mono">
          <Link
            href={`/${boardCode}`}
            className="text-accent hover:underline font-bold whitespace-nowrap"
          >
            <span className="hidden sm:inline">[ Kembali ke /{boardCode}/ ]</span>
            <span className="sm:hidden">[ Kembali ]</span>
          </Link>
          <Link
            href={`/${boardCode}?view=catalog`}
            className="text-accent hover:underline font-bold whitespace-nowrap"
          >
            [ Katalog ]
          </Link>
        </div>
        <div className="text-base sm:text-xl font-bold text-accent text-center sm:text-right truncate max-w-full">
          /{board.code}/ - {board.name}
        </div>
      </header>

      <main className="mx-auto px-4 md:px-8 py-8 w-full max-w-none">
        <ThreadPageWrapper
          thread={thread}
          replies={replies || []}
          boardCode={boardCode}
          userRole={user?.role}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
