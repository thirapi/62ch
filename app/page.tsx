import Link from "next/link";
import {
  getBoardList,
  getLatestPosts,
  getRecentImages,
  getSystemStats,
} from "@/lib/actions/home.actions";
import { footerLinks, footerText } from "@/constants/footer";
import { FormattedText } from "@/components/formatted-text";
import { getThumbnailUrl } from "@/lib/utils/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "62chan",
  description:
    "62chan: Forum papan gambar (imageboard) anonim Indonesia. Beritahu kami jika Anda menemukan masalah yang disebabkan oleh pembaruan sistem di /tlg/",
};

export const revalidate = 60; // Cache halaman selama 60 detik

// Group boards by category based on fscchan structure
function groupBoards(boards: any[]) {
  const popkultur = ["wibu", "gim", "sass", "oc", "cb", "med", "rj"];
  const kekinian = [
    "pol",
    "mipa",
    "pew",
    "omni",
    "jas",
    "wang",
    "kul",
    "oto",
    "ac",
    "tre",
  ];
  const bebas = ["b", "dio", "mis", "sjrh", "tlg"];

  return {
    popkultur: boards.filter((b) => popkultur.includes(b.code)),
    kekinian: boards.filter((b) => kekinian.includes(b.code)),
    bebas: boards.filter((b) => bebas.includes(b.code)),
  };
}

export default async function HomePage() {
  const boards = await getBoardList();
  const latestPosts = await getLatestPosts(10);
  const recentImages = await getRecentImages(25);
  const stats = await getSystemStats();

  const groupedBoards = groupBoards(boards);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Header */}
      <header className="py-8 text-center border-b">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground mb-1">62チャンネル</p>
          <h1 className="text-3xl sm:text-4xl font-bold">
            62<span className="text-accent">chan</span>
          </h1>

          {/* <p className="text-sm text-muted-foreground">
            Autismo Sans Frontières
          </p> */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1 max-w-6xl">
        {/* Board List - 4chan style with columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 md:gap-y-10">
          {/* Popkultur */}
          {groupedBoards.popkultur.length > 0 && (
            <section className="bg-card/30 p-4 rounded-lg border border-border/50 shadow-sm md:bg-transparent md:p-0 md:border-none md:shadow-none">
              <h2 className="text-xl font-bold mb-3 text-accent border-b pb-1">
                Popkultur
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 md:gap-y-1 text-sm">
                {groupedBoards.popkultur.map((board) => (
                  <div key={board.id} className="leading-relaxed">
                    <Link
                      href={`/${board.code}`}
                      className="hover:underline hover:text-accent group flex items-center gap-2 md:inline md:gap-0"
                    >
                      <span className="text-accent font-bold">
                        /{board.code}/
                      </span>
                      <span className="md:hidden"> - </span>
                      <span className="text-foreground md:inline hidden md:ml-1"> - {board.name}</span>
                      <span className="text-foreground md:hidden truncate">{board.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Kekinian */}
          {groupedBoards.kekinian.length > 0 && (
            <section className="bg-card/30 p-4 rounded-lg border border-border/50 shadow-sm md:bg-transparent md:p-0 md:border-none md:shadow-none">
              <h2 className="text-xl font-bold mb-3 text-accent border-b pb-1">
                Kekinian
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 md:gap-y-1 text-sm">
                {groupedBoards.kekinian.map((board) => (
                  <div key={board.id} className="leading-relaxed">
                    <Link
                      href={`/${board.code}`}
                      className="hover:underline hover:text-accent group flex items-center gap-2 md:inline md:gap-0"
                    >
                      <span className="text-accent font-bold">
                        /{board.code}/
                      </span>
                      <span className="md:hidden"> - </span>
                      <span className="text-foreground md:inline hidden md:ml-1"> - {board.name}</span>
                      <span className="text-foreground md:hidden truncate">{board.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bebas */}
          {groupedBoards.bebas.length > 0 && (
            <section className="bg-card/30 p-4 rounded-lg border border-border/50 shadow-sm md:bg-transparent md:p-0 md:border-none md:shadow-none">
              <h2 className="text-xl font-bold mb-3 text-accent border-b pb-1">
                Bebas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-4 gap-y-2 md:gap-y-1 text-sm">
                {groupedBoards.bebas.map((board) => (
                  <div key={board.id} className="leading-relaxed">
                    <Link
                      href={`/${board.code}`}
                      className="hover:underline hover:text-accent group flex items-center gap-2 md:inline md:gap-0"
                    >
                      <span className="text-accent font-bold">
                        /{board.code}/
                      </span>
                      <span className="md:hidden"> - </span>
                      <span className="text-foreground md:inline hidden md:ml-1"> - {board.name}</span>
                      <span className="text-foreground md:hidden truncate">{board.name}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Activity Section */}
        {(latestPosts.length > 0 || recentImages.length > 0) && (
          <div className="border-t mt-12 pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Latest Posts */}
              {latestPosts.length > 0 && (
                <section className="lg:col-span-5">
                  <h2 className="text-lg font-bold mb-3 text-accent border-b pb-1">
                    Postingan Terbaru
                  </h2>
                  <div className="space-y-2">
                    {latestPosts.map((post) => (
                      <Link
                        key={`${post.type}-${post.id}`}
                        href={`/${post.boardCode}/thread/${post.threadId}`}
                        className="block text-sm hover:bg-accent/5 p-2 rounded transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate text-xs">
                              {post.title || (
                                <span className="text-muted-foreground italic">
                                  {post.type === "thread" ? "Utas" : "Balasan"}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              <FormattedText content={post.excerpt} preview />
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-accent font-bold whitespace-nowrap">
                            /{post.boardCode}/
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Images */}
              {recentImages.length > 0 && (
                <section className="lg:col-span-7">
                  <h2 className="text-lg font-bold mb-3 text-accent border-b pb-1">
                    Gambar Terbaru
                  </h2>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {recentImages.map((image) => (
                      <Link
                        key={`${image.id}-${image.imageUrl}`}
                        href={`/${image.boardCode}/thread/${image.threadId}`}
                        className="group"
                      >
                        <div className="aspect-square flex items-center justify-center overflow-hidden rounded border border-muted/50 group-hover:border-accent transition-all bg-muted/20 relative">
                          <img
                            src={getThumbnailUrl(image.imageUrl, 200, 200)}
                            alt={`Gambar terbaru di 62chan - ${image.boardCode}`}
                            className={`w-full h-full object-cover transition-all ${
                              image.isSpoiler || image.isNsfw
                                ? "blur-xl scale-110 opacity-60"
                                : "grayscale-[0.2] group-hover:grayscale-0"
                            }`}
                            loading="lazy"
                          />
                          {(image.isSpoiler || image.isNsfw) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">
                                {image.isSpoiler ? "SPOILER" : "NSFW"}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/10">
        <div className="container mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-3 text-xs font-mono">
            <Link href="/" className="text-accent hover:underline">
              Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/rules" className="text-accent hover:underline">
              Peraturan
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">{footerText}</p>
        </div>
      </footer>

      {/* Site Stats - Absolute Bottom */}
      <div className="border-t py-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-muted-foreground/80 whitespace-nowrap uppercase tracking-tighter">
            <span>
              [ Total Posts:{" "}
              <span className="text-accent font-bold">
                {stats.totalPosts.toLocaleString()}
              </span>{" "}
              ]
            </span>
            <span>
              [ Posts Today:{" "}
              <span className="text-accent font-bold">
                {stats.postsToday.toLocaleString()}
              </span>{" "}
              ]
            </span>
            <span>
              [ Total Images:{" "}
              <span className="text-accent font-bold">
                {stats.totalImages.toLocaleString()}
              </span>{" "}
              ]
            </span>
            <span>
              [ Active Threads:{" "}
              <span className="text-accent font-bold">
                {stats.activeThreads24h.toLocaleString()}
              </span>{" "}
              ]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
