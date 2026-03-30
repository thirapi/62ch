import Link from "next/link";
import { headers } from "next/headers";
import {
  getBoardList,
  getBoardCategories, // NEW
  getLatestPosts,
  getRecentImages,
  getSystemStats,
} from "@/lib/actions/home.actions";
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

export const metadata: Metadata = {
  title: "62chan",
  description:
    "62chan: Forum papan gambar (imageboard) anonim Indonesia. Beritahu kami jika Anda menemukan masalah yang disebabkan oleh pembaruan sistem di /tlg/",
  alternates: {
    canonical: "https://62chan.qzz.io",
  },
};

export const revalidate = 60; // Cache halaman selama 60 detik

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

  const postsLimit = isMobile ? 10 : 15;
  const imagesLimit = isMobile ? 20 : 25;

  const [boards, categories, latestPosts, recentImages, stats] =
    await Promise.all([
      getBoardList(),
      getBoardCategories(),
      getLatestPosts(postsLimit),
      getRecentImages(imagesLimit),
      getSystemStats(),
    ]);

  const groupedBoards = groupBoards(boards, categories);
  const categoryNames = Array.from(groupedBoards.keys()).filter(
    (name) => groupedBoards.get(name)!.length > 0,
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className="relative py-12 text-center overflow-hidden 
             bg-gradient-to-b from-accent/15 to-transparent 
             dark:from-accent/5 dark:to-transparent"
      >
        <div className="container mx-auto px-4 relative">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            62
            <span className="text-accent underline decoration-4 decoration-accent/10 underline-offset-4">
              chan
            </span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 md:gap-y-10">
          {categoryNames.map((categoryName) => (
            <section
              key={categoryName}
              className="bg-card/30 p-4 rounded-lg border border-border/50 shadow-sm md:bg-transparent md:p-0 md:border-none md:shadow-none"
            >
              <h2 className="text-xl font-semibold mb-3 text-accent border-b pb-1">
                {categoryName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 md:gap-y-1 text-sm">
                {groupedBoards.get(categoryName)!.map((board) => (
                  <div key={board.id} className="leading-relaxed">
                    <BoardLink
                      boardCode={board.code}
                      className="hover:underline hover:text-accent group flex flex-col md:inline text-left"
                    >
                      <span className="text-accent font-bold leading-none">
                        /{board.code}/
                      </span>
                      <span className="text-foreground/90 md:hidden text-[11px] leading-tight mt-0.5 font-medium break-words">
                        {board.name}
                      </span>
                      <span className="text-foreground md:inline hidden md:ml-1">
                        {" "}
                        - {board.name}
                      </span>
                    </BoardLink>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Activity Section */}
        {(latestPosts.length > 0 || recentImages.length > 0) && (
          <div className="border-t mt-12 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Latest Posts */}
              {latestPosts.length > 0 && (
                <LatestPosts initialPosts={latestPosts} isMobile={isMobile} />
              )}

              {/* Recent Images */}
              {recentImages.length > 0 && (
                <section className="lg:col-span-7">
                  <h2 className="text-lg font-semibold mb-3 text-accent border-b pb-1">
                    Gambar Terbaru
                  </h2>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {recentImages.map((image) => (
                      <ThreadPreview
                        key={`img-preview-${image.id}`}
                        subject={image.threadSubject}
                        excerpt={image.threadExcerpt}
                        boardCode={image.boardCode}
                        isNsfw={image.isNsfw}
                        isSpoiler={image.isSpoiler}
                      >
                        <Link
                          key={`${image.id}-${image.imageUrl}`}
                          href={`/${image.boardCode}/thread/${image.threadId}#p${image.postNumber}`}
                          className="group"
                        >
                          <RecentImage
                            imageUrl={image.imageUrl}
                            isNsfw={image.isNsfw}
                            isSpoiler={image.isSpoiler}
                            boardCode={image.boardCode}
                          />
                        </Link>
                      </ThreadPreview>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter stats={stats} />
    </div>
  );
}
