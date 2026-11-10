import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Archive, ImageIcon } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { FormattedDate } from "@/components/formatted-date";
import { getBoardByCodeCached } from "@/lib/data/request-cache";
import { getArchivedThreads } from "@/lib/actions/thread.actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board: boardCode } = await params;
  const board = await getBoardByCodeCached(boardCode);
  if (!board) return { title: "Board Not Found" };

  return {
    title: `Arsip /${board.code}/ - ${board.name}`,
    description: `Thread yang sudah diarsipkan di /${board.code}/ - ${board.name}.`,
    robots: { index: false },
  };
}

function excerptOf(subject: string | null, excerpt: string) {
  if (subject) return subject;
  const clean = excerpt.replace(/\s+/g, " ").trim();
  return clean.length > 120 ? clean.slice(0, 120) + "…" : clean || "(tanpa teks)";
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ board: string }>;
}) {
  const { board: boardCode } = await params;
  const board = await getBoardByCodeCached(boardCode);
  if (!board) notFound();

  const threads = await getArchivedThreads(board.id);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="py-1.5 px-3 sm:px-4 border-b flex items-center justify-between gap-2 bg-muted/5 text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-mono">
          <Link
            href={`/${board.code}`}
            className="text-accent hover:underline font-bold whitespace-nowrap"
          >
            <span className="hidden sm:inline">[ Kembali ke /{board.code}/ ]</span>
            <span className="sm:hidden">[ Kembali ]</span>
          </Link>
          <Link
            href={`/${board.code}?view=catalog`}
            className="text-accent hover:underline font-bold whitespace-nowrap"
          >
            [ Katalog ]
          </Link>
        </div>
        <div className="font-bold text-accent truncate">
          /{board.code}/ - {board.name}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-3 sm:px-4 py-6 sm:py-8 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Archive className="h-5 w-5 text-accent" />
          <h1 className="text-xl sm:text-2xl font-bold">Arsip /{board.code}/</h1>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-5">
          Thread yang tergeser dari board. Arsip hanya bisa dibaca — tidak bisa dibalas.
        </p>

        {threads.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground italic border border-dashed border-muted/50 rounded-lg">
            Belum ada thread yang diarsipkan.
          </div>
        ) : (
          <div className="border border-muted/30 rounded-md overflow-hidden">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-muted/10 text-muted-foreground text-[11px] uppercase tracking-wide">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold w-24">No.</th>
                  <th className="px-3 py-2 font-semibold">Thread</th>
                  <th className="px-3 py-2 font-semibold text-right w-20 hidden sm:table-cell">Balasan</th>
                  <th className="px-3 py-2 font-semibold w-40 hidden md:table-cell">Aktif terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/20">
                {threads.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-3 py-2 font-mono text-muted-foreground align-top">
                      {t.postNumber}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Link
                        href={`/${board.code}/thread/${t.id}`}
                        className="hover:text-accent hover:underline break-words"
                      >
                        {t.subject ? (
                          <span className="font-semibold">{excerptOf(t.subject, t.excerpt)}</span>
                        ) : (
                          excerptOf(t.subject, t.excerpt)
                        )}
                      </Link>
                      {t.hasImage && (
                        <ImageIcon
                          className="inline h-3 w-3 ml-1.5 text-muted-foreground/60 align-[-1px]"
                          aria-label="Ada gambar"
                        />
                      )}
                      <span className="sm:hidden block text-[10px] text-muted-foreground mt-0.5">
                        {t.replyCount} balasan
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground align-top hidden sm:table-cell">
                      {t.replyCount}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground align-top hidden md:table-cell">
                      <FormattedDate date={t.bumpedAt} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
