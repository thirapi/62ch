"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getThreadDetail, getWatchedThreadStatuses } from "@/lib/actions/thread.actions";

export interface WatchedThread {
  id: number;
  boardCode: string;
  subject: string | null;
  snippet: string;
  lastReadReplyCount: number;
  currentReplyCount: number;
  currentImageCount: number;
  firstUnreadPostNumber: number | null;
  hasNewReplyToMe: boolean;
  isDeleted?: boolean;
  lastUpdateAt: number;
}

interface ThreadWatcherContextType {
  watchedThreads: WatchedThread[];
  myPosts: number[];
  isWatcherOpen: boolean;
  toggleWatcher: () => void;
  watchThread: (thread: { id: number; boardCode: string; subject: string | null; lastReadReplyCount: number; snippet: string }) => void;
  unwatchThread: (threadId: number) => void;
  addMyPost: (postNumber: number) => void;
  markAsRead: (threadId: number, currentCount: number) => void;
  refresh: () => Promise<void>;
}

const ThreadWatcherContext = createContext<ThreadWatcherContextType | undefined>(undefined);

export function ThreadWatcherProvider({ children }: { children: React.ReactNode }) {
  const [watchedThreads, setWatchedThreads] = useState<WatchedThread[]>([]);
  const [myPosts, setMyPosts] = useState<number[]>([]);
  const [isWatcherOpen, setIsWatcherOpen] = useState(false);
  const isFetchingRef = useRef(false);
  const pollTimerRef = useRef<NodeJS.Timeout>(undefined);


  // Load from localStorage
  useEffect(() => {
    const savedThreads = localStorage.getItem("ib-watched-threads");
    const savedMyPosts = localStorage.getItem("ib-my-posts");
    
    if (savedThreads) {
      try {
        setWatchedThreads(JSON.parse(savedThreads));
      } catch (e) {
        console.error("Failed to parse watched threads", e);
      }
    }
    
    if (savedMyPosts) {
      try {
        setMyPosts(JSON.parse(savedMyPosts));
      } catch (e) {
        console.error("Failed to parse my posts", e);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("ib-watched-threads", JSON.stringify(watchedThreads));
  }, [watchedThreads]);

  useEffect(() => {
    localStorage.setItem("ib-my-posts", JSON.stringify(myPosts));
  }, [myPosts]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ib-watched-threads" && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setWatchedThreads(newData);
        } catch (err) {
          console.error("Failed to sync watched threads from storage event", err);
        }
      }
      if (e.key === "ib-my-posts" && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setMyPosts(newData);
        } catch (err) {
          console.error("Failed to sync my posts from storage event", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleWatcher = useCallback(() => setIsWatcherOpen(prev => !prev), []);

  const watchThread = useCallback((thread: { id: number; boardCode: string; subject: string | null; lastReadReplyCount: number; snippet: string }) => {
    setWatchedThreads(prev => {
      if (prev.find(t => t.id === thread.id)) return prev;
      return [...prev, { 
        ...thread, 
        currentReplyCount: thread.lastReadReplyCount, 
        currentImageCount: 0,
        firstUnreadPostNumber: null,
        hasNewReplyToMe: false,
        lastUpdateAt: Date.now()
      }];
    });
  }, []);

  const unwatchThread = useCallback((threadId: number) => {
    setWatchedThreads(prev => prev.filter(t => t.id !== threadId));
  }, []);

  const addMyPost = useCallback((postNumber: number) => {
    setMyPosts(prev => {
      if (prev.includes(postNumber)) return prev;
      const newPosts = [...prev, postNumber];
      localStorage.setItem("ib-my-posts", JSON.stringify(newPosts));
      return newPosts;
    });
  }, []);

  const markAsRead = useCallback((threadId: number, currentCount: number) => {
    setWatchedThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { 
          ...t, 
          lastReadReplyCount: currentCount, 
          hasNewReplyToMe: false,
          firstUnreadPostNumber: null
        };
      }
      return t;
    }));
  }, []);

  // Polling logic: one cheap batched status query for every watched thread;
  // full thread detail is fetched only for threads that actually changed.
  const checkThreads = useCallback(async () => {
    if (watchedThreads.length === 0 || isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const statuses = await getWatchedThreadStatuses(watchedThreads.map((t) => t.id));
      if (!statuses) return; // network/server error — keep current state
      const byId = new Map(statuses.map((st) => [st.id, st]));
      const myPostSet = new Set(myPosts);

      const updatedThreads = await Promise.all(watchedThreads.map(async (wt): Promise<WatchedThread> => {
        const st = byId.get(wt.id);
        if (!st || st.isDeleted) return { ...wt, isDeleted: true };

        let hasNewReplyToMe = wt.hasNewReplyToMe;
        let firstUnreadPostNumber = wt.firstUnreadPostNumber;
        const grew = st.replyCount > wt.currentReplyCount;
        const needsFirstUnread = st.replyCount > wt.lastReadReplyCount && !firstUnreadPostNumber;

        if (grew || needsFirstUnread) {
          try {
            const detail = await getThreadDetail(wt.id);
            if (!detail) return { ...wt, isDeleted: true };

            if (needsFirstUnread) {
              firstUnreadPostNumber = detail.replies[wt.lastReadReplyCount]?.postNumber ?? null;
            }
            if (grew && myPostSet.size > 0) {
              const newReplies = detail.replies.slice(wt.currentReplyCount);
              hasNewReplyToMe ||= newReplies.some((reply) =>
                Array.from(reply.content.matchAll(/>>(\d+)/g)).some((m) => myPostSet.has(Number(m[1]))),
              );
            }
          } catch (e) {
            console.error(`Failed to check thread ${wt.id}`, e);
            return wt;
          }
        }

        return {
          ...wt,
          currentReplyCount: st.replyCount,
          currentImageCount: st.imageCount,
          firstUnreadPostNumber,
          hasNewReplyToMe,
          isDeleted: false,
          lastUpdateAt: st.lastActivityAt,
        };
      }));

      // Only update state if something actually changed to avoid re-renders.
      // Merge by id: the user may have (un)watched threads while we were fetching.
      setWatchedThreads(prev => {
        const updatedById = new Map(updatedThreads.map((t) => [t.id, t]));
        let changed = false;
        const next = prev.map((p) => {
          const ut = updatedById.get(p.id);
          if (!ut) return p;
          const differs =
            ut.currentReplyCount !== p.currentReplyCount ||
            ut.currentImageCount !== p.currentImageCount ||
            ut.firstUnreadPostNumber !== p.firstUnreadPostNumber ||
            ut.hasNewReplyToMe !== p.hasNewReplyToMe ||
            ut.isDeleted !== p.isDeleted ||
            ut.lastUpdateAt !== p.lastUpdateAt;
          if (!differs) return p;
          changed = true;
          // Keep read-state fields from prev (markAsRead may have run meanwhile)
          return { ...ut, lastReadReplyCount: p.lastReadReplyCount };
        });
        return changed ? next : prev;
      });
    } finally {
      isFetchingRef.current = false;
    }
  }, [watchedThreads, myPosts]);


  // Polling management. checkThreads changes identity on every state update, so
  // read it through a ref; the loop itself only restarts when the watch list grows/shrinks.
  const checkThreadsRef = useRef(checkThreads);
  checkThreadsRef.current = checkThreads;

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      await checkThreadsRef.current();
      if (!cancelled) pollTimerRef.current = setTimeout(poll, 60000);
    };

    poll();

    return () => {
      cancelled = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [watchedThreads.length]);

  return (
    <ThreadWatcherContext.Provider value={{
      watchedThreads,
      myPosts,
      isWatcherOpen,
      toggleWatcher,
      watchThread,
      unwatchThread,
      addMyPost,
      markAsRead,
      refresh: checkThreads
    }}>
      {children}
    </ThreadWatcherContext.Provider>
  );
}

export function useThreadWatcher() {
  const context = useContext(ThreadWatcherContext);
  if (context === undefined) {
    throw new Error("useThreadWatcher must be used within a ThreadWatcherProvider");
  }
  return context;
}
