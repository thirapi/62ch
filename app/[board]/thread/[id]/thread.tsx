"use client";

import { useState } from "react";
import { Lock, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReplyForm } from "@/components/reply-form";
import { ReportButton } from "@/components/report-button";
import { ImageLightbox } from "@/components/image-lightbox";
import { FormattedText } from "@/components/formatted-text";
import { Backlinks } from "@/components/backlinks";
import { DeletePostButton } from "@/components/delete-post-button";
import { ThreadUI } from "@/lib/entities/thread.entity";
import { ReplyUI } from "@/lib/entities/reply.entity";
import { useRouter } from "next/navigation";
import { FormattedDate } from "@/components/formatted-date";
import { QuickReply } from "@/components/quick-reply";
import { ExpandableImage } from "@/components/expandable-image";
import { TripcodeDisplay } from "@/components/tripcode-display";
import { ReplyProvider, useReply } from "@/components/reply-context";
import { useThreadWatcher } from "@/components/thread-watcher-provider";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useHiding } from "@/hooks/use-hiding";
import { X, Plus } from "lucide-react";

interface ThreadClientProps {
  thread: ThreadUI;
  replies: ReplyUI[];
  boardCode: string;
  userRole?: string;
}

export function ThreadClient({
  thread,
  replies,
  boardCode,
  userRole,
}: ThreadClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const router = useRouter();
  const { state, setContent } = useReply();
  const { watchedThreads, watchThread, unwatchThread, markAsRead } = useThreadWatcher();
  const { isThreadHidden, isReplyHidden, hideThread, hideReply, unhideThread, unhideReply, isLoaded } = useHiding();

  const isWatched = watchedThreads.some(t => t.id === thread.id);

  useEffect(() => {
    markAsRead(thread.id, replies.length);
  }, [thread.id, replies.length, markAsRead]);

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
    setLightboxOpen(true);
  };

  const handleLightboxOpenChange = (open: boolean) => {
    setLightboxOpen(open);
    if (!open) {
      setSelectedImage("");
    }
  };

  const handleQuote = (postNumber: number) => {
    setQrOpen(true);
    const quoteText = `>>${postNumber}\n`;
    setContent((prev: string) => prev + quoteText);

    // Suggest focus after a short delay to allow QR to render if it wasn't
    setTimeout(() => {
      const textarea =
        document.getElementById("qr-reply-content") ||
        document.getElementById("reply-content");
      if (textarea) (textarea as HTMLTextAreaElement).focus();
    }, 50);
  };

  // Backlink calculation
  const allPosts = [
    {
      type: "thread" as const,
      id: thread.id,
      postNumber: thread.postNumber,
      content: thread.content,
    },
    ...replies.map((r) => ({
      type: "reply" as const,
      id: r.id,
      postNumber: r.postNumber,
      content: r.content,
    })),
  ];

  const getBacklinks = (targetPostNumber: number) => {
    return allPosts.filter((post) => {
      const quoteRegex = />>(\d+)/g;
      const matches = post.content.matchAll(quoteRegex);
      for (const match of matches) {
        if (Number.parseInt(match[1]) === targetPostNumber) {
          return true;
        }
      }
      return false;
    });
  };

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
    <>
      {/* OP Post */}
      <div id={`p${thread.postNumber}`} className="ib-post mb-12">
        <div className="ib-post-metaline border-b border-muted/20 pb-1">
          {thread.isDeleted && (
            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded mr-2 font-bold border border-red-500/20">
              POSTINGAN DIHAPUS
            </span>
          )}
          {thread.isPinned && (
            <Pin className="h-3 w-3 text-accent fill-accent" />
          )}
          {thread.isLocked && (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
          {thread.subject && (
            <h1 className="ib-subject text-lg mr-2 inline">{thread.subject}</h1>
          )}
          <div className="flex items-baseline gap-1">
            <TripcodeDisplay
              author={thread.author || "Awanama"}
              className="ib-author text-base"
              hideTrip={!!thread.capcode}
            />
            <CapcodeMarker type={thread.capcode} className="text-base" />
          </div>
          {thread.posterId && (
            <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground ml-1 font-mono">
              ID: {thread.posterId}
            </span>
          )}
          <span className="text-muted-foreground text-xs">
            <FormattedDate date={thread.createdAt} />
          </span>
          <span
            className="ib-post-number font-bold ml-1 cursor-pointer hover:underline"
            onClick={() => handleQuote(thread.postNumber)}
          >
            No.{thread.postNumber}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 ml-2",
              isWatched ? "text-accent" : "text-muted-foreground"
            )}
            onClick={() => {
              if (isWatched) {
                unwatchThread(thread.id);
              } else {
                watchThread({
                  id: thread.id,
                  boardCode: boardCode,
                  subject: thread.subject,
                  lastReadReplyCount: replies.length,
                  snippet: thread.content.substring(0, 50) + (thread.content.length > 50 ? "..." : "")
                });
              }
            }}
            title={isWatched ? "Berhenti pantau thread" : "Pantau thread ini"}
          >
            {isWatched ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>

          <div className="flex items-center gap-1 ml-auto">
            <DeletePostButton
              postId={thread.id}
              postType="thread"
              boardCode={boardCode}
            />
            <ReportButton contentType="thread" contentId={thread.id} />
          </div>
        </div>

        <div className="mt-4 block">
          {thread.image && (
            <ExpandableImage
              src={thread.image}
              alt="Thread image"
              metadata={thread.imageMetadata || undefined}
              isOP={true}
              isNsfw={thread.isNsfw}
              isSpoiler={thread.isSpoiler}
              onFullScreen={() => handleImageClick(thread.image!)}
            />
          )}
          <div className="text-base leading-relaxed whitespace-pre-wrap break-words ib-content">
            <FormattedText content={thread.content} />
            <Backlinks links={getBacklinks(thread.postNumber)} />
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4 mb-12">
        {replies.map((reply) => {
          const hidden = isLoaded && isReplyHidden(reply.id);
          
          if (hidden) {
            return (
              <div 
                key={reply.id} 
                className="ib-reply border border-muted/20 shadow-sm table max-w-none"
              >
                <div className="px-2 bg-muted/5 flex items-center gap-1 text-[10px] text-muted-foreground opacity-80">
                  <button 
                    onClick={() => unhideReply(reply.id)}
                    className="hover:underline font-bold"
                    title="Tampilkan kembali"
                  >
                    <span>[Tampilkan Balasan No.{reply.postNumber}]</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={reply.id}
              id={`p${reply.postNumber}`}
              className={`ib-reply border border-muted/20 shadow-sm relative group table max-w-none ${reply.isDeleted ? 'opacity-70 grayscale-[50%]' : ''}`}
            >
              <div className={`ib-post-metaline px-2 pt-1 border-b ${reply.isDeleted ? 'bg-red-500/5' : 'bg-muted/5'}`}>
                {reply.isDeleted && (
                  <span className="text-[10px] bg-red-500/10 text-red-500 px-1 mr-1 rounded font-bold border border-red-500/20">
                    DIHAPUS
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <TripcodeDisplay
                    author={reply.author || "Awanama"}
                    className="ib-author"
                    hideTrip={!!reply.capcode}
                  />
                  <CapcodeMarker type={reply.capcode} />
                </div>
                {reply.posterId && (
                  <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground ml-1 font-mono">
                    ID: {reply.posterId}
                  </span>
                )}
                <span className="text-muted-foreground opacity-70 text-xs">
                  <FormattedDate date={reply.createdAt} />
                </span>
                <span
                  className="ib-post-number font-bold cursor-pointer hover:underline"
                  onClick={() => handleQuote(reply.postNumber)}
                >
                  No.{reply.postNumber}
                </span>

                <button
                  onClick={() => hideReply(reply.id)}
                  className="text-[11px] hover:underline flex items-center gap-1 text-muted-foreground ml-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  title="Sembunyikan post"
                >
                  [X]
                </button>

                <div className="flex items-center gap-1 ml-auto opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <DeletePostButton
                    postId={reply.id}
                    postType="reply"
                    boardCode={boardCode}
                  />
                  <ReportButton contentType="reply" contentId={reply.id} />
                </div>
              </div>

              <div className="p-3 block overflow-hidden">
                {reply.image && (
                  <ExpandableImage
                    src={reply.image}
                    alt="Reply image"
                    metadata={reply.imageMetadata || undefined}
                    isNsfw={reply.isNsfw}
                    isSpoiler={reply.isSpoiler}
                    onFullScreen={() => handleImageClick(reply.image!)}
                  />
                )}
                <div className="whitespace-pre-wrap break-words leading-relaxed text-sm lg:text-base">
                  <FormattedText content={reply.content} />
                  <Backlinks links={getBacklinks(reply.postNumber)} />
                </div>
              </div>
            </div>
          );
        })}

        {replies.length === 0 && (
          <div className="py-12 text-center text-muted-foreground italic border border-dashed rounded-lg">
            Belum ada balasan. Jadilah yang pertama memberikan tanggapan!
          </div>
        )}
      </div>

      {/* Reply Form Section */}
      <div className="mt-20 border-t pt-12 flex justify-center">
        <div className="w-full max-w-2xl bg-card p-6 rounded-xl border shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-accent underline decoration-2">
              Kirim Balasan
            </span>
            {thread.isLocked && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </h3>

          {!thread.isLocked ? (
            <ReplyForm 
              threadId={thread.id} 
              boardCode={boardCode} 
              userRole={userRole}
            />
          ) : (
            <div className="py-8 text-center bg-muted/20 rounded-lg">
              <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Thread ini terkunci. Anda tidak bisa mengirim balasan baru.
              </p>
            </div>
          )}
        </div>
      </div>

      <ImageLightbox
        src={selectedImage}
        alt="Image lightbox"
        open={lightboxOpen}
        onOpenChange={handleLightboxOpenChange}
      />

      <QuickReply
        threadId={thread.id}
        boardCode={boardCode}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        userRole={userRole}
      />
      <div id="bottom" />
    </>
  );
}

export default function ThreadPageWrapper(props: ThreadClientProps) {
  return (
    <ReplyProvider>
      <ThreadClient {...props} />
    </ReplyProvider>
  );
}
