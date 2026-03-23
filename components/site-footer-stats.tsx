"use client";

interface SiteStats {
  totalPosts: number;
  postsToday: number;
  totalImages: number;
  activeThreads24h: number;
}

export function SiteFooterStats({ stats }: { stats: SiteStats }) {
  return (
    <div className="border-t py-4 bg-muted/5 overflow-hidden">
      <div className="container mx-auto px-4 text-center space-y-4">
        {/* Stats Section */}
        <div className="relative">
          {/* Desktop: Static & Centered */}
          <div className="hidden md:flex justify-center items-center gap-8 text-[10px] font-mono text-muted-foreground/80 tracking-tight">
            <span>
              [ Total Postingan:{" "}
              <span className="text-accent font-bold">
                {stats.totalPosts.toLocaleString()}
              </span>{" "}
              ]
            </span>
            <span>
              [ Postingan Hari Ini:{" "}
              <span className="text-accent font-bold">
                {stats.postsToday.toLocaleString()}
              </span>{" "}
              ]
            </span>
            <span>
              [ Total Gambar:{" "}
              <span className="text-accent font-bold">
                {stats.totalImages.toLocaleString()}
              </span>{" "}
              ]
            </span>
            <span>
              [ Thread Aktif:{" "}
              <span className="text-accent font-bold">
                {stats.activeThreads24h.toLocaleString()}
              </span>{" "}
              ]
            </span>
          </div>

          {/* Mobile: CSS Marquee */}
          <div className="md:hidden flex whitespace-nowrap">
            <div className="flex animate-marquee gap-10 items-center text-[10px] font-mono text-muted-foreground/80 pr-10">
              <span className="">
                Total Postingan:{" "}
                <span className="text-accent font-bold">
                  {stats.totalPosts.toLocaleString()}
                </span>
              </span>
              <span className="">
                Postingan Hari Ini:{" "}
                <span className="text-accent font-bold">
                  {stats.postsToday.toLocaleString()}
                </span>
              </span>
              <span className="">
                Total Gambar:{" "}
                <span className="text-accent font-bold">
                  {stats.totalImages.toLocaleString()}
                </span>
              </span>
              <span className="">
                Thread Aktif:{" "}
                <span className="text-accent font-bold">
                  {stats.activeThreads24h.toLocaleString()}
                </span>
              </span>
            </div>
            {/* Duplicate for seamless loop */}
            <div
              className="flex animate-marquee gap-10 items-center text-[10px] font-mono text-muted-foreground/80 pr-10"
              aria-hidden="true"
            >
              <span className="">
                Total Postingan:{" "}
                <span className="text-accent font-bold">
                  {stats.totalPosts.toLocaleString()}
                </span>
              </span>
              <span className="">
                Postingan Hari Ini:{" "}
                <span className="text-accent font-bold">
                  {stats.postsToday.toLocaleString()}
                </span>
              </span>
              <span className="">
                Total Gambar:{" "}
                <span className="text-accent font-bold">
                  {stats.totalImages.toLocaleString()}
                </span>
              </span>
              <span className="">
                Thread Aktif:{" "}
                <span className="text-accent font-bold">
                  {stats.activeThreads24h.toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Email/Legal Notice */}
        <div className="border-t border-muted/20 pt-4">
          <p className="text-[10px] text-muted-foreground/60">
            <a href="mailto:62chan@duck.com" className="hover:text-accent underline decoration-accent/20 underline-offset-2 font-mono">62chan@duck.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
