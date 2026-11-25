import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import {
  getBoardList,
  getBoardCategories,
  getLatestPosts,
  getRecentImages,
  getSystemStats,
  getAnnouncements,
} from "@/lib/actions/home.actions";
import { HomeAnnouncement } from "@/components/home-announcement";
import { footerLinks, footerText } from "@/constants/footer";
import { FormattedText } from "@/components/formatted-text";
import { getThumbnailUrl } from "@/lib/utils/image";
import { LatestPosts } from "@/components/latest-posts";
import { ThreadPreview } from "@/components/thread-preview";
import { BoardLink } from "@/components/board-link";
import { SiteFooter } from "@/components/site-footer";
import { RecentImage } from "@/components/recent-image";
import type { Metadata } from "next";
import { BoardEntity, BoardCategoryEntity } from "@/lib/entities/board.entity";
import { VerifiedLink } from "@/components/verified-link";

export const metadata: Metadata = {
  title: "62chan",
  description:
    "62chan: Forum papan gambar (imageboard) anonim Indonesia. Beritahu kami jika Anda menemukan masalah yang disebabkan oleh pembaruan sistem di /tlg/",
  alternates: {
    canonical: "https://62chan.qzz.io",
  },
};

// Group boards by category based on fscchan structure
function groupBoards(boards: BoardEntity[], categories: BoardCategoryEntity[]) {
  const groups: Map<string, BoardEntity[]> = new Map();

  // Initialize ordered categories from DB
  categories.forEach((cat) => {
    groups.set(cat.name, []);
  });

  // Handle board sorting
  boards.forEach((board) => {
    const key = board.categoryName || "Lainnya";
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(board);
  });

  return groups;
}

export default async function HomePage() {
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);

  const postsLimit = isMobile ? 20 : 25;
  const imagesLimit = isMobile ? 8 : 12;

  const [boards, categories, latestPosts, recentImages, announcements] =
    await Promise.all([
      getBoardList(),
      getBoardCategories(),
      getLatestPosts(postsLimit),
      getRecentImages(imagesLimit),
      getAnnouncements(3),
    ]);


  const groupedBoards = groupBoards(boards, categories);
  const categoryNames = Array.from(groupedBoards.keys()).filter(
    (name) => groupedBoards.get(name)!.length > 0,
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="pt-5 pb-2 sm:pt-8 sm:pb-4 text-center">
        <div className="container mx-auto px-4 relative">
          <h1 className="flex justify-center">
            <Image
              src="/logo-62chan.webp"
              alt="62chan"
              width={640}
              height={496}
              priority
              sizes="(max-width: 640px) 176px, (max-width: 768px) 256px, 288px"
              className="w-44 sm:w-64 md:w-72 h-auto max-w-[70vw] object-contain"
            />
            <span className="sr-only">62chan</span>
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[960px] px-3 sm:px-4 pt-2 pb-6 sm:pt-3 sm:pb-8 flex-1 space-y-3">
        <HomeAnnouncement announcements={announcements} />

        {/* Boards */}
        <section className="ib-box">
          <h2 className="ib-box-bar">Board</h2>
          {/* Desktop: one equal column per category. Phones: categories stacked,
              boards inside each category split into two columns. */}
          <div
            className="grid grid-cols-1 gap-y-3 gap-x-6 px-3 py-2.5 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
            style={{ "--cols": Math.min(Math.max(categoryNames.length, 1), 4) } as React.CSSProperties}
          >
            {categoryNames.map((categoryName) => (
              <div key={categoryName}>
                <h3 className="mb-1 font-bold underline underline-offset-2 text-[13px] text-ib-bar-text">
                  {categoryName}
                </h3>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px] leading-tight sm:block sm:leading-[1.45]">
                  {groupedBoards.get(categoryName)!.map((board) => (
                    <li key={board.id}>
                      <BoardLink boardCode={board.code} className="group flex flex-col sm:inline hover:underline">
                        <span className="font-bold text-accent">/{board.code}/</span>
                        <span className="hidden sm:inline"> </span>
                        <span className="truncate text-[12px] sm:text-[13px] text-foreground/85 sm:text-foreground group-hover:text-accent">
                          {board.name}
                        </span>
                      </BoardLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Activity */}
        {(latestPosts.length > 0 || recentImages.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {latestPosts.length > 0 && (
              <LatestPosts initialPosts={latestPosts} isMobile={isMobile} />
            )}

            {recentImages.length > 0 && (
              <section className="ib-box flex flex-col">
                <h2 className="ib-box-bar">Gambar Terbaru</h2>
                <div className="relative flex-1 p-1.5">
                  <div className="overflow-y-auto max-h-[440px] sm:max-h-[600px] pr-1 custom-scrollbar">
                    <div className="columns-2 sm:columns-3 gap-1.5">
                      {recentImages.map((image) => (
                        <div key={`img-wrap-${image.postNumber}-${image.id}`} className="break-inside-avoid mb-1.5 w-full">
                          <ThreadPreview
                            key={`img-preview-${image.id}`}
                            subject={image.threadSubject}
                            excerpt={image.threadExcerpt}
                            boardCode={image.boardCode}
                            isNsfw={image.isNsfw}
                            isSpoiler={image.isSpoiler}
                          >
                            <VerifiedLink
                              key={`${image.id}-${image.imageUrl}`}
                              href={`/${image.boardCode}/thread/${image.threadId}#p${image.postNumber}`}
                              className="group block w-full"
                            >
                              <RecentImage
                                imageUrl={image.imageUrl}
                                isNsfw={image.isNsfw}
                                isSpoiler={image.isSpoiler}
                                boardCode={image.boardCode}
                              />
                            </VerifiedLink>
                          </ThreadPreview>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-ib-box to-transparent" />
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
