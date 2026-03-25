"use client";

import Link from "next/link";
import { MessageSquare, ImageIcon, Pin, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThumbnailUrl } from "@/lib/utils/image";
import { FormattedText } from "@/components/formatted-text";
import { useNav } from "./nav-provider";
import { Play, X, Plus } from "lucide-react";
import { useHiding } from "@/hooks/use-hiding";
import { FormEvent, useState } from "react";

interface CatalogViewProps {
  threads: any[];
  boardCode: string;
}

export function CatalogView({ threads, boardCode }: CatalogViewProps) {
  const { autoPlayGif } = useNav();
  const { isThreadHidden, hideThread, unhideThread, isLoaded } = useHiding();
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-3 gap-y-6 opacity-0 animate-in fade-in duration-300">
        {threads.map((thread) => (
          <div key={thread.id} className="aspect-square bg-muted/10 rounded animate-pulse" />
        ))}
      </div>
    );
  }

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
    showHiddenOnly ? isThreadHidden(t.id) : !isThreadHidden(t.id)
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden Threads Navbar */}
      {hiddenThreadsCount > 0 && (
        <div className="flex justify-end border-b border-muted/20 pb-1">
          <div className="text-[10px] text-muted-foreground flex items-center">
            Hidden threads: {hiddenThreadsCount}
            <button
              onClick={() => setShowHiddenOnly(!showHiddenOnly)}
              className="text-accent font-bold hover:underline ml-1"
            >
              [{showHiddenOnly ? "Hide" : "Show"}]
            </button>
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-3 gap-y-6">
        {visibleThreads.map((thread) => {
          return (
            <Link
              key={thread.id}
              href={`/${boardCode}/thread/${thread.id}`}
              className="group flex flex-col items-center"
            >
            {/* Thumbnail Container */}
            <div className="relative w-full aspect-square bg-muted/20 border border-muted/40 rounded shadow-sm overflow-hidden transition-all duration-200 group-hover:scale-[1.02] group-hover:border-accent group-hover:shadow-md">
              {thread.image ? (
                <div className="relative w-full h-full">
                  <img
                    src={getThumbnailUrl(thread.image, 250, 250, "fill", !autoPlayGif)}
                    alt={thread.subject || "Thread image"}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-500",
                      (thread.isNsfw || thread.isSpoiler) && "blur-xl scale-110",
                    )}
                    loading="lazy"
                  />
                  {thread.image.toLowerCase().endsWith(".gif") && !autoPlayGif && !thread.isNsfw && !thread.isSpoiler && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded border border-white/20">
                        GIF
                      </div>
                    </div>
                  )}
                  {(thread.isNsfw || thread.isSpoiler) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="bg-black/80 border border-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-tighter">
                        {thread.isNsfw ? "NSFW" : "Spoiler"}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/20 bg-muted/5 font-mono">
                  <ImageIcon className="h-10 w-10 stroke-[1px]" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    No Image
                  </span>
                </div>
              )}

              {/* Badges (Pinned/Locked) */}
              <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
                {thread.isPinned && (
                  <div className="bg-accent text-white p-1 rounded-sm shadow-md backdrop-blur-sm">
                    <Pin className="h-3 w-3 fill-white" />
                  </div>
                )}
                {thread.isLocked && (
                  <div className="bg-black/60 text-white p-1 rounded-sm shadow-md backdrop-blur-sm">
                    <Lock className="h-3 w-3 fill-white" />
                  </div>
                )}
                {/* Hide / Unhide Button */}
                {!showHiddenOnly ? (
                  <button
                    onClick={(e) => handleHide(e, thread.id)}
                    className="bg-black/60 hover:bg-black/90 text-white p-1 rounded-sm shadow-md backdrop-blur-sm transition-colors group/hide"
                    title="Sembunyikan thread"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      unhideThread(thread.id);
                    }}
                    className="bg-accent/80 hover:bg-accent text-white p-1 rounded-sm shadow-md backdrop-blur-sm transition-colors group/hide"
                    title="Tampilkan thread ini kembali"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Statistics below image */}
            <div className="mt-1 w-full text-center text-[10px] font-bold text-muted-foreground/80 font-mono">
              R: {thread.replyCount} / I: {thread.imageCount ?? 0}
            </div>

            {/* Metadata / Text */}
            <div className="mt-0.5 w-full text-center px-1 font-sans">
              {thread.subject && (
                <h3 className="text-[12px] font-bold line-clamp-2 leading-snug text-accent group-hover:underline decoration-1 underline-offset-2 mb-0.5 break-words">
                  {thread.subject}
                </h3>
              )}
              <div className="text-[11px] text-muted-foreground line-clamp-4 overflow-hidden leading-snug font-medium opacity-90 group-hover:opacity-100 transition-opacity break-words text-center">
                <FormattedText content={thread.content} preview={true} disableEmbeds={true} />
              </div>
            </div>
          </Link>
        );
      })}
      </div>
    </div>
  );
}
