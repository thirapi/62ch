"use client";

import { useCallback, useSyncExternalStore } from "react";

const THREADS_KEY = "62chan_hidden_threads";
const REPLIES_KEY = "62chan_hidden_replies";
const EMPTY: number[] = [];

// One shared store for every component on the page, instead of each list item
// reading and parsing localStorage on its own after mount.
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; ids: number[] }>();

function read(key: string): number[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return EMPTY;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.ids;
  let ids = EMPTY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) ids = parsed;
    } catch {
      // ignore corrupt value
    }
  }
  cache.set(key, { raw, ids });
  return ids;
}

function write(key: string, ids: number[]) {
  try {
    if (ids.length) localStorage.setItem(key, JSON.stringify(ids));
    else localStorage.removeItem(key);
  } catch {
    // storage unavailable (private mode etc.)
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THREADS_KEY || e.key === REPLIES_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY;

export function useHiding() {
  const hiddenThreads = useSyncExternalStore(subscribe, () => read(THREADS_KEY), getServerSnapshot);
  const hiddenReplies = useSyncExternalStore(subscribe, () => read(REPLIES_KEY), getServerSnapshot);

  const hideThread = useCallback((id: number) => {
    const cur = read(THREADS_KEY);
    if (!cur.includes(id)) write(THREADS_KEY, [...cur, id]);
  }, []);
  const unhideThread = useCallback((id: number) => {
    write(THREADS_KEY, read(THREADS_KEY).filter((t) => t !== id));
  }, []);
  const hideReply = useCallback((id: number) => {
    const cur = read(REPLIES_KEY);
    if (!cur.includes(id)) write(REPLIES_KEY, [...cur, id]);
  }, []);
  const unhideReply = useCallback((id: number) => {
    write(REPLIES_KEY, read(REPLIES_KEY).filter((r) => r !== id));
  }, []);
  const clearHiddenThreads = useCallback(() => write(THREADS_KEY, []), []);
  const clearHiddenReplies = useCallback(() => write(REPLIES_KEY, []), []);

  return {
    hiddenThreads,
    hiddenReplies,
    hideThread,
    unhideThread,
    hideReply,
    unhideReply,
    clearHiddenThreads,
    clearHiddenReplies,
    isThreadHidden: (id: number) => hiddenThreads.includes(id),
    isReplyHidden: (id: number) => hiddenReplies.includes(id),
    // Kept for API compatibility: content is always renderable now (server and
    // first client render show everything; hidden posts collapse right after).
    isLoaded: true,
  };
}
