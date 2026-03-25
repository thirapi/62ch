"use client";

import Link from "next/link";
import { Pin, Lock, X } from "lucide-react";
import { FormattedText } from "@/components/formatted-text";
import { FormattedDate } from "@/components/formatted-date";
import { ExpandableImage } from "@/components/expandable-image";
import { TripcodeDisplay } from "@/components/tripcode-display";
import { useHiding } from "@/hooks/use-hiding";
import { cn } from "@/lib/utils";

interface ThreadListItemProps {
  thread: any;
  boardCode: string;
}

export function ThreadListItem({ thread, boardCode }: ThreadListItemProps) {
  const { isThreadHidden, hideThread, unhideThread, isLoaded } = useHiding();

  if (!isLoaded) return null;

  if (isThreadHidden(thread.id)) {
    return (
      <div className="ib-post py-1 px-2 border-b border-muted/20 text-[10px] text-muted-foreground flex items-center gap-1 opacity-80">
        <button 
          onClick={() => unhideThread(thread.id)}
          className="hover:underline"
          title="Tampilkan kembali"
        >
        <span>[Tampilkan Utas No.{thread.postNumber}]</span>
        </button>
      </div>
    );
  }

  const CapcodeMarker = ({
    type,
    className,
  }: {
    type: string | null | undefined;
    className?: string;
  }) => {
    if (!type) return null;
    if (type === "mod" || type === "moderator") {
      return (
        <span
          className={cn(
            "text-purple-600 dark:text-purple-400 font-bold leading-none",
            className,
          )}
        >
          ## Mod
        </span>
      );
    }
    if (type === "admin") {
      return (
        <span
          className={cn(
            "text-red-600 dark:text-red-400 font-bold leading-none",
            className,
          )}
        >
          ## Admin
        </span>
      );
    }
    return null;
  };

  return (
    <div className="ib-post py-2 first:pt-0">
      {/* Meta line */}
      <div className="ib-post-metaline items-center">
        {thread.isPinned && (
          <Pin className="h-3 w-3 text-accent fill-accent" />
        )}
        {thread.isLocked && (
          <Lock className="h-3 w-3 text-muted-foreground" />
        )}
        {thread.subject && (
          <span className="ib-subject">{thread.subject}</span>
        )}
        <div className="flex items-baseline gap-1">
          <TripcodeDisplay
            author={thread.author || "Awanama"}
            className="ib-author"
            hideTrip={!!thread.capcode}
          />
          <CapcodeMarker type={thread.capcode} />
        </div>
        <span className="text-muted-foreground text-xs">
          <FormattedDate date={thread.createdAt} />
        </span>
        <Link
          href={`/${boardCode}/thread/${thread.id}`}
          className="ib-post-number"
        >
          No.{thread.postNumber}
        </Link>

        {/* Hide Button */}
        <button 
          onClick={() => hideThread(thread.id)}
          className="text-[11px] hover:underline flex items-center gap-1 text-muted-foreground"
          title="Sembunyikan"
        >
          [X]
        </button>
        <Link
          href={`/${boardCode}/thread/${thread.id}`}
          className="text-[11px] hover:underline flex items-center gap-1 text-muted-foreground"
        >
          [Balas]
        </Link>
      
      </div>

      {/* Content area */}
      <div className="mt-2 block overflow-hidden">
        {thread.image && (
          <ExpandableImage
            src={thread.image}
            alt="Thumbnail"
            metadata={thread.imageMetadata || undefined}
            isNsfw={thread.isNsfw}
            isSpoiler={thread.isSpoiler}
            isOP={true}
          />
        )}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          <FormattedText content={thread.content} />
        </div>

        {thread.replyCount > (thread.replies?.length || 0) && (
          <div className="mt-4 text-xs text-muted-foreground italic clear-both">
            {thread.replyCount - (thread.replies?.length || 0)}{" "}
            balasan diabaikan.
            <Link
              href={`/${boardCode}/thread/${thread.id}`}
              className="text-accent hover:underline ml-1"
            >
              Klik di sini untuk melihat semua.
            </Link>
          </div>
        )}
      </div>

      {/* Reply Previews */}
      {thread.replies && thread.replies.length > 0 && (
        <div className="mt-4 space-y-3 ml-4 sm:ml-12 max-w-5xl">
          {thread.replies
            .slice()
            .reverse()
            .slice(0, 3)
            .reverse()
            .map((reply: any) => (
              <div
                key={reply.id}
                className="ib-reply shadow-sm border border-muted/20 w-fit max-w-full"
              >
                <div className="ib-post-metaline text-xs px-2 pt-1 border-b border-muted/5 bg-muted/5">
                  <div className="flex items-baseline gap-1">
                    <TripcodeDisplay
                      author={reply.author || "Awanama"}
                      className="ib-author"
                      hideTrip={!!reply.capcode}
                    />
                    <CapcodeMarker type={reply.capcode} />
                  </div>
                  <span className="text-muted-foreground opacity-70">
                    <FormattedDate date={reply.createdAt} />
                  </span>
                  <span className="ib-post-number opacity-80">
                    No.{reply.postNumber}
                  </span>
                </div>
                <div className="p-2 block overflow-hidden">
                  {reply.image && (
                    <ExpandableImage
                      src={reply.image}
                      alt="Reply thumbnail"
                      metadata={reply.imageMetadata || undefined}
                      isNsfw={reply.isNsfw}
                      isSpoiler={reply.isSpoiler}
                    />
                  )}
                  <div className="text-sm leading-snug">
                    <FormattedText content={reply.content} />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
