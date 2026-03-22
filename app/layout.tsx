import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
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
  authors: [{ name: "62chan", url: "https://62chan.my.id" }],
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
    "4chan indonesia",
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
    process.env.NEXT_PUBLIC_BASE_URL || "https://62chan.my.id",
  ),
  alternates: {
    canonical: "https://62chan.my.id",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://62chan.my.id",
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
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "62chan",
    alternateName: ["Enam Dua Chan", "62 chan", "Enampuluhdua Chan"],
    url: "https://62chan.my.id",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://62chan.my.id/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "62chan",
    alternateName: ["Enam Dua Chan", "62 chan"],
    url: "https://62chan.my.id",
    logo: "https://62chan.my.id/opengraph-image",
    description:
      "62chan adalah forum papan gambar (imageboard) anonim Indonesia untuk diskusi bebas anonim.",
    sameAs: [],
  },
];

import { ThemeProvider } from "@/components/theme-provider";
import { NavProvider } from "@/components/nav-provider";
import { BoardNav } from "@/components/board-nav";
import { AgeVerificationDialog } from "@/components/age-verification-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollButtons } from "@/components/scroll-buttons";
import { PostHogProvider } from "./posthog-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavProvider>
              <TooltipProvider>
                <BoardNav />
                {children}
                <Toaster />
                <SonnerToaster />
                <Analytics />
                <AgeVerificationDialog />
                <ScrollButtons />
              </TooltipProvider>
            </NavProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
