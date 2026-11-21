"use client";

import { IntentLink as Link } from "@/components/intent-link";
import { Pin, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThumbnailUrl } from "@/lib/utils/image";
import { FormattedText } from "@/components/formatted-text";
import { useNav } from "./nav-provider";
import { useHiding } from "@/hooks/use-hiding";
import { FormEvent, useEffect, useState } from "react";

interface CatalogViewProps {
  threads: any[];
  boardCode: string;
}

type ThumbSize = "small" | "large";

const SIZE = {
  small: { col: "minmax(150px,1fr)", img: "max-w-[150px] max-h-[150px]", px: 250 },
  large: { col: "minmax(250px,1fr)", img: "max-w-[250px] max-h-[250px]", px: 400 },
} as const;

function usePref<T extends string>(key: string, fallback: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key) as T | null;
      if (saved) setValue(saved);
    } catch {}
  }, [key]);
  const update = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {}
  };
  return [value, update];
}

/** Classic catalog: uncropped thumbnails, R/I counts, subject + OP teaser. */
export function CatalogView({ threads, boardCode }: CatalogViewProps) {
  const { autoPlayGif } = useNav();
  const { isThreadHidden, hideThread, unhideThread } = useHiding();
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [size, setSize] = usePref<ThumbSize>("ib-catalog-size", "small");
  const [teaser, setTeaser] = usePref<"on" | "off">("ib-catalog-teaser", "on");

  const handleHide = (e: FormEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    hideThread(id);
  };

  const hiddenThreadsCount = threads.filter((t) => isThreadHidden(t.id)).length;
  // Auto-reset to normal view if there are no more hidden threads
  if (showHiddenOnly && hiddenThreadsCount === 0) {
    setShowHiddenOnly(false);
  }

  const visibleThreads = threads.filter((t) =>
    showHiddenOnly ? isThreadHidden(t.id) : !isThreadHidden(t.id),
  );

  const option = (active: boolean, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={active ? "font-bold text-foreground cursor-default" : "text-accent hover:underline cursor-pointer"}
    >
      [{label}]
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Catalog options */}
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          Ukuran: {option(size === "small", "Kecil", () => setSize("small"))}
          {option(size === "large", "Besar", () => setSize("large"))}
        </span>
        <span className="flex items-center gap-1">
          Teks OP: {option(teaser === "on", "Tampil", () => setTeaser("on"))}
          {option(teaser === "off", "Sembunyi", () => setTeaser("off"))}
        </span>
        {hiddenThreadsCount > 0 && (
          <span className="flex items-center gap-1">
            Disembunyikan: {hiddenThreadsCount}
            {option(showHiddenOnly, showHiddenOnly ? "Kembali" : "Lihat", () => setShowHiddenOnly(!showHiddenOnly))}
          </span>
        )}
      </div>

      {/* Catalog grid */}
      <div
        className="grid gap-x-2 gap-y-5"
        style={{ gridTemplateColumns: `repeat(auto-fill, ${SIZE[size].col})` }}
      >
        {visibleThreads.map((thread) => {
          const hiddenImage = thread.isNsfw || thread.isSpoiler;
          const isGif = thread.image?.toLowerCase().endsWith(".gif");
          return (
            <div key={thread.id} className="group relative flex flex-col items-center text-center">
              <Link href={`/${boardCode}/thread/${thread.id}`} className="relative inline-block">
                {thread.image ? (
                  <span className="relative block overflow-hidden shadow-[0_0_5px_rgba(0,0,0,0.25)]">
                    <img
                      src={getThumbnailUrl(thread.image, SIZE[size].px, SIZE[size].px, "fit", !autoPlayGif)}
                      alt={thread.subject || "Thread image"}
                      className={cn(
                        "block w-auto h-auto object-contain",
                        SIZE[size].img,
                        hiddenImage && "blur-xl scale-110",
                      )}
                      loading="lazy"
                    />
                    {hiddenImage && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {thread.isNsfw ? "NSFW" : "Spoiler"}
                        </span>
                      </span>
                    )}
                    {isGif && !autoPlayGif && !hiddenImage && (
                      <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-[9px] font-bold text-white">
                        GIF
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex h-[100px] w-[100px] items-center justify-center border border-ib-border bg-ib-reply font-mono text-[10px] text-muted-foreground">
                    tanpa gambar
                  </span>
                )}
              </Link>

              {/* Hide / unhide: on hover for pointer devices, always on touch screens */}
              <button
                type="button"
                onClick={(e) => {
                  if (showHiddenOnly) {
                    e.preventDefault();
                    unhideThread(thread.id);
                  } else {
                    handleHide(e, thread.id);
                  }
                }}
                className="absolute top-0 right-1 font-mono text-[11px] text-accent hover:underline [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                title={showHiddenOnly ? "Tampilkan thread ini kembali" : "Sembunyikan thread"}
              >
                [{showHiddenOnly ? "+" : "−"}]
              </button>

              {/* Counts and status */}
              <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                {thread.isPinned && <Pin className="h-3 w-3 text-accent" aria-label="Disematkan" />}
                {thread.isLocked && <Lock className="h-3 w-3" aria-label="Dikunci" />}
                <span>
                  R: <b className="text-foreground">{thread.replyCount}</b>
                  {(thread.imageCount ?? 0) > 0 && (
                    <>
                      {" "}/ I: <b className="text-foreground">{thread.imageCount}</b>
                    </>
                  )}
                </span>
              </div>

              {/* Subject + OP teaser */}
              <Link
                href={`/${boardCode}/thread/${thread.id}`}
                className="mt-0.5 w-full px-1 text-[12px] leading-snug break-words hover:underline line-clamp-6"
              >
                {thread.subject && <b className="ib-subject">{thread.subject}</b>}
                {thread.subject && teaser === "on" && ": "}
                {teaser === "on" && (
                  <span className="text-foreground">
                    <FormattedText content={thread.content} preview={true} disableEmbeds={true} />
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
