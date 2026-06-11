"use client";

import Link from "next/link";
import { Pin, Lock, X } from "lucide-react";
import { FormattedText } from "@/components/formatted-text";
import { FormattedDate } from "@/components/formatted-date";
import { ExpandableImage } from "@/components/expandable-image";
import { TripcodeDisplay } from "@/components/tripcode-display";
import { useHiding } from "@/hooks/use-hiding";
import { cn } from "@/lib/utils";
import { PostActions } from "@/components/post-actions";
import { CapcodeMarker } from "@/components/capcode-marker";

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

  return (
    <div id={`p${thread.postNumber}`} className="ib-post py-1 first:pt-0 scroll-mt-14">
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
        <span className="flex items-center">
          <Link
            href={`/${boardCode}/thread/${thread.id}`}
            className="ib-post-number"
            title="Tautan Postingan"
          >
            No.
          </Link>
          <Link
            href={`/${boardCode}/thread/${thread.id}`}
            className="ib-post-number"
            title="Balas postingan ini"
          >
            {thread.postNumber}
          </Link>

          <PostActions 
            postId={thread.id} 
            postType="thread" 
            boardCode={boardCode} 
            onHide={() => hideThread(thread.id)}
          />
        </span>
        
        <Link
          href={`/${boardCode}/thread/${thread.id}`}
          className="text-[11px] hover:underline flex items-center gap-1 text-muted-foreground"
        >
          [Balas]
        </Link>
      
      </div>

      {/* Content area */}
      <div className="mt-1 block">
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

        {/* Reply Previews - Moved inside to allow flow around OP image */}
        {thread.replies && thread.replies.length > 0 && (
          <div className="mt-1 space-y-1">
            {thread.replies
              .slice()
              .reverse()
              .slice(0, 3)
              .reverse()
              .map((reply: any) => (
                <div key={reply.id} className="flex items-start gap-1">
                  <span className="text-muted-foreground/20 font-serif select-none mt-2 hidden lg:inline-block">
                    &gt;&gt;
                  </span>
                  <div
                    id={`p${reply.postNumber}`}
                    className="ib-reply shadow-sm border border-muted/20 table max-w-none scroll-mt-14"
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
                      <span className="flex items-center opacity-80">
                        <Link
                          href={`/${boardCode}/thread/${thread.id}#p${reply.postNumber}`}
                          className="ib-post-number"
                          title="Tautan Postingan"
                        >
                          No.
                        </Link>
                        <Link
                          href={`/${boardCode}/thread/${thread.id}#p${reply.postNumber}`}
                          className="ib-post-number"
                          title="Balas postingan ini"
                        >
                          {reply.postNumber}
                        </Link>
                      </span>
                    </div>
                    <div className="p-1 px-2 block overflow-hidden">
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
                </div>
              ))}
          </div>
        )}

        {thread.replyCount > (thread.replies?.length || 0) && (
          <div className="mt-1 text-xs text-muted-foreground italic lg:clear-none clear-both">
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
        <div className="clear-both" />
      </div>
    </div>
  );
}
