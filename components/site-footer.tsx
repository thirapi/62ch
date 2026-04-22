"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { footerText } from "@/constants/footer";
import { getSystemStats } from "@/lib/actions/home.actions";


interface SiteStats {
  totalPosts: number;
  postsToday: number;
  totalImages: number;
  activeThreads24h: number;
}

export function SiteFooter() {
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <>
      {/* Footer */}
      <footer className="border-t py-6 bg-muted/10">
        <div className="container mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-3 text-xs font-mono">
            <Link href="/" className="text-accent hover:underline">
              beranda
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/rules" className="text-accent hover:underline">
              peraturan
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/donasi"
              className="text-accent hover:underline"
              title="Dukung operasional server"
            >
              donasi
            </Link>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-accent hover:underline focus:outline-none disabled:opacity-50"
              disabled={loading && !stats}
            >
              {loading && !stats ? "memuat statistik..." : "statistik situs"}
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground/60 max-w-2xl mx-auto leading-relaxed">
              Semua postingan di 62chan adalah tanggung jawab pengunggahnya dan
              bukan tanggung jawab 62chan.
              <br />
              Untuk keluhan hukum, hak cipta, atau laporan konten ilegal, kirim
              ke:{" "}
              <a
                href="mailto:62chan@duck.com"
                className="hover:text-accent underline decoration-accent/20 underline-offset-2"
              >
                62chan@duck.com
              </a>
              .
            </p>
          </div>
        </div>
      </footer>

      {/* Site Stats - Absolute Bottom */}
      {stats && showStats && (
        <div className="border-t py-2 bg-muted/5 overflow-hidden group animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className="relative">
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

            {/* Desktop: Static & Centered */}
            <div className="hidden md:flex container mx-auto px-4 justify-center items-center gap-8 text-[10px] font-mono text-muted-foreground/80 tracking-tight">
              <span>
                Total Postingan:{" "}
                <span className="text-accent font-bold">
                  {stats.totalPosts.toLocaleString()}
                </span>{" "}
              </span>
              <span>
                Postingan Hari Ini:{" "}
                <span className="text-accent font-bold">
                  {stats.postsToday.toLocaleString()}
                </span>{" "}
              </span>
              <span>
                Total Gambar:{" "}
                <span className="text-accent font-bold">
                  {stats.totalImages.toLocaleString()}
                </span>{" "}
              </span>
              <span>
                Thread Aktif:{" "}
                <span className="text-accent font-bold">
                  {stats.activeThreads24h.toLocaleString()}
                </span>{" "}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


