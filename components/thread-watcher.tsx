"use client";

import { useThreadWatcher } from "./thread-watcher-provider";
import { 
  X, 
  GripHorizontal, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  RotateCw 
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function ThreadWatcher() {
  const { 
    watchedThreads, 
    isWatcherOpen, 
    toggleWatcher, 
    unwatchThread, 
    markAsRead, 
    refresh 
  } = useThreadWatcher();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const watcherRef = useRef<HTMLDivElement>(null);

  // Load position
  useEffect(() => {
    const saved = localStorage.getItem("ib-watcher-pos");
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load watcher position", e);
      }
    }
  }, []);

  // Save position
  useEffect(() => {
    localStorage.setItem("ib-watcher-pos", JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (watcherRef.current) {
      setIsDragging(true);
      const rect = watcherRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && watcherRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        const maxX = window.innerWidth - watcherRef.current.offsetWidth;
        const maxY = window.innerHeight - watcherRef.current.offsetHeight;

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isWatcherOpen) return null;

  // Sort by ID descending (or last update if available, but staying simple)
  const sortedThreads = [...watchedThreads].sort((a, b) => b.id - a.id);

  return (
    <div
      ref={watcherRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "fixed",
        zIndex: 50,
      }}
      className={cn(
        "w-[calc(100vw-1rem)] sm:w-[320px] bg-card border shadow-2xl rounded-xl overflow-hidden",
        isMinimized ? "h-auto" : "max-h-[80vh] flex flex-col"
      )}
    >
      {/* Header / Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-muted/50 p-2 cursor-move flex items-center justify-between border-b"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] font-bold opacity-70">
            Utas yang diikuti
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await refresh();
              } finally {
                setTimeout(() => setIsRefreshing(false), 500); // Small delay for UX
              }
            }}
            title="Refresh"
            disabled={isRefreshing}
          >
            <RotateCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
            onClick={toggleWatcher}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="overflow-y-auto p-2 space-y-1">
          {sortedThreads.map((thread) => {
            const hasNew = thread.currentReplyCount > thread.lastReadReplyCount;
            const newCount = thread.currentReplyCount - thread.lastReadReplyCount;
            
            return (
              <div 
                key={thread.id}
                className={cn(
                  "flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-muted/50 text-[11px]",
                  thread.isDeleted && "opacity-50 grayscale"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground whitespace-nowrap">/{thread.boardCode}/</span>
                  <Link 
                    href={`/${thread.boardCode}/thread/${thread.id}${thread.firstUnreadPostNumber ? `#p${thread.firstUnreadPostNumber}` : (hasNew ? '#bottom' : '')}`}
                    onClick={() => markAsRead(thread.id, thread.currentReplyCount)}
                    className={cn(
                      "truncate hover:underline",
                      thread.hasNewReplyToMe ? "text-red-600 font-bold" : (hasNew ? "text-accent font-medium" : "")
                    )}
                  >
                    {thread.subject || thread.snippet || thread.id}
                  </Link>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    "font-mono px-1 rounded",
                    hasNew ? "bg-accent/10 text-accent font-bold" : "text-muted-foreground opacity-60"
                  )}>
                    {thread.currentReplyCount}{hasNew && `(+${newCount})`}
                  </span>
                  <button
                    onClick={() => unwatchThread(thread.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {watchedThreads.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-xs italic">
              Daftar pantauan kosong
            </div>
          )}
        </div>
      )}
    </div>
  );
}
