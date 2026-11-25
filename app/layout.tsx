import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NavigationProgress } from "@/components/navigation-progress";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "62chan",
    template: "%s | 62chan",
  },
  description:
    "62chan adalah forum papan gambar (imageboard) anonim Indonesia. Di 62chan, kamu bisa diskusi bebas anonim soal anime, teknologi, budaya pop, meme, dan topik lainnya.",
  applicationName: "62chan",
  authors: [{ name: "62chan", url: "https://62chan.qzz.io" }],
  generator: "62chan",
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "62chan",
    "62 chan",
    "imageboard",
    "imageboard Indonesia",
    "papan gambar",
    "forum anonim",
    "forum indonesia",
    "62chan indonesia",
    "komunitas wibu",
    "diskusi bebas",
    "asf",
    "autismo sans frontieres",
    "papan anonim",
    "taman lawang",
    "indonesia imageboard",
  ],
  referrer: "origin-when-cross-origin",
  creator: "62chan Team",
  publisher: "62chan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://62chan.qzz.io",
  ),
  alternates: {
    // Canonical will be handled by individual pages to avoid indexing everything to home
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://62chan.qzz.io",
    siteName: "62chan",
    title: "62chan - Papan Gambar Anonim Indonesia",
    description:
      "62chan adalah forum papan gambar (imageboard) anonim Indonesia. Di 62chan, kamu bisa diskusi bebas anonim soal anime, teknologi, budaya pop, meme, dan topik lainnya.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "62chan - Papan Gambar Anonim Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "62chan - Papan Gambar Anonim Indonesia",
    description:
      "62chan adalah forum papan gambar (imageboard) anonim Indonesia. Di 62chan, kamu bisa diskusi bebas anonim soal anime, teknologi, budaya pop, meme, dan topik lainnya.",
    images: ["/opengraph-image"],
  },
  category: "forum",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#7CB342",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "62chan",
    alternateName: ["Enam Dua Chan", "62 chan", "Enampuluhdua Chan"],
    url: "https://62chan.qzz.io",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://62chan.qzz.io/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "62chan",
    alternateName: ["Enam Dua Chan", "62 chan"],
    url: "https://62chan.qzz.io",
    logo: "https://62chan.qzz.io/opengraph-image",
    description:
      "62chan adalah forum papan gambar (imageboard) anonim Indonesia untuk diskusi bebas anonim.",
    sameAs: [],
  },
];

import { ThemeProvider } from "@/components/theme-provider";
import { NavProvider } from "@/components/nav-provider";
import { BoardNav } from "@/components/board-nav";
import { AgeVerificationProvider } from "@/components/age-verification-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollButtons } from "@/components/scroll-buttons";
import { PostHogPageView } from "@/components/posthog-page-view";
import { IB_STYLE_BOOT_SCRIPT } from "@/lib/ib-style";
import { ThreadWatcherProvider } from "@/components/thread-watcher-provider";
import { ThreadWatcher } from "@/components/thread-watcher";
import { Suspense } from "react";
import { ScrollReset } from "@/components/scroll-reset";

export default function RootLayout({    
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: IB_STYLE_BOOT_SCRIPT }} />
        {jsonLd.map((schema, i) => (
          <script
            key={`jsonld-${i}`}
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
          />
        ))}
      </head>
      <body className={`font-sans antialiased`}>
        <PostHogPageView />
        <Suspense fallback={null}>
          <NavigationProgress />
          <ScrollReset />
        </Suspense>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavProvider>
              <Suspense fallback={null}>
                <AgeVerificationProvider>
                  <TooltipProvider>
                    <ThreadWatcherProvider>
                      <Suspense fallback={<div className="h-8 bg-muted/5 animate-pulse" />}>
                        <BoardNav />
                      </Suspense>

                      <div className="flex-1 w-full overflow-x-clip min-h-0">
                        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" /></div>}>
                          {children}
                        </Suspense>
                      </div>

                      <Toaster />
                      <ThreadWatcher />
                      <Analytics />
                      <SpeedInsights />
                      <ScrollButtons />
                    </ThreadWatcherProvider>
                  </TooltipProvider>
                </AgeVerificationProvider>
              </Suspense>
            </NavProvider>
          </ThemeProvider>

      </body>
    </html>
  );
}
