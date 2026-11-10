"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getThreadStatus } from "@/lib/actions/thread.actions";

/** First check runs this many seconds after load / after a change. */
const BASE_INTERVAL_S = 15;
/** Quiet threads back off to this ceiling. */
const MAX_INTERVAL_S = 60;
/** While the tab is in the background we never poll faster than this. */
const HIDDEN_MIN_INTERVAL_S = 30;

interface Options {
  threadId: number;
  /** Non-deleted replies currently rendered (matches the server's count). */
  knownReplyCount: number;
  isLocked: boolean;
  isArchived: boolean;
  enabled: boolean;
}

export type AutoUpdateState = "idle" | "checking" | "gone";

/**
 * Polls a lightweight status endpoint and only triggers a full `router.refresh()`
 * when something actually changed. Quiet threads back off from 15s to 60s.
 */
export function useThreadAutoUpdate({
  threadId,
  knownReplyCount,
  isLocked,
  isArchived,
  enabled,
}: Options) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  // Epoch ms of the next scheduled check. Only changes once per cycle, so the
  // page doesn't re-render every second — <AutoUpdateCountdown> ticks on its own.
  const [nextCheckAt, setNextCheckAt] = useState<number | null>(null);
  const [state, setState] = useState<AutoUpdateState>("idle");

  const intervalRef = useRef(BASE_INTERVAL_S);
  const knownRef = useRef({ count: knownReplyCount, isLocked, isArchived });
  const checkingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Props are the source of truth after every refresh
  useEffect(() => {
    knownRef.current = { count: knownReplyCount, isLocked, isArchived };
  }, [knownReplyCount, isLocked, isArchived]);

  const checkRef = useRef<(manual?: boolean) => Promise<void>>(async () => {});

  const schedule = useCallback((seconds: number) => {
    clearTimeout(timerRef.current);
    if (!enabledRef.current) {
      setNextCheckAt(null);
      return;
    }
    const hidden = typeof document !== "undefined" && document.hidden;
    const delay = (hidden ? Math.max(seconds, HIDDEN_MIN_INTERVAL_S) : seconds) * 1000;
    setNextCheckAt(Date.now() + delay);
    timerRef.current = setTimeout(() => void checkRef.current(), delay);
  }, []);

  const check = useCallback(
    async (manual = false) => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      clearTimeout(timerRef.current);
      setState("checking");
      try {
        const status = await getThreadStatus(threadId);
        if (!status) {
          setState("gone");
          setNextCheckAt(null);
          return;
        }
        const known = knownRef.current;
        const changed =
          status.replyCount !== known.count ||
          status.isLocked !== known.isLocked ||
          status.isArchived !== known.isArchived;

        if (changed || manual) {
          // Optimistically adopt the new count so we don't double-refresh
          knownRef.current = {
            count: status.replyCount,
            isLocked: status.isLocked,
            isArchived: status.isArchived,
          };
          startTransition(() => router.refresh());
        }

        intervalRef.current = changed
          ? BASE_INTERVAL_S
          : Math.min(intervalRef.current * 2, MAX_INTERVAL_S);
        setState("idle");
        schedule(intervalRef.current);
      } catch {
        setState("idle");
        schedule(MAX_INTERVAL_S);
      } finally {
        checkingRef.current = false;
      }
    },
    [threadId, router, schedule],
  );
  checkRef.current = check;

  // Start / stop the cycle
  useEffect(() => {
    if (enabled) {
      intervalRef.current = BASE_INTERVAL_S;
      schedule(BASE_INTERVAL_S);
    } else {
      clearTimeout(timerRef.current);
      setNextCheckAt(null);
    }
    return () => clearTimeout(timerRef.current);
  }, [enabled, schedule]);

  // Coming back to the tab: check soon instead of waiting out a long backoff
  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => {
      if (!document.hidden && !checkingRef.current) {
        intervalRef.current = BASE_INTERVAL_S;
        schedule(2);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled, schedule]);

  const updateNow = useCallback(() => {
    intervalRef.current = BASE_INTERVAL_S;
    void check(true);
  }, [check]);

  return {
    nextCheckAt: state === "gone" ? null : nextCheckAt,
    isChecking: state === "checking" || isRefreshing,
    isGone: state === "gone",
    updateNow,
  };
}

/** Self-contained 1s ticker so only this <span> re-renders, not the whole thread. */
export function useSecondsUntil(target: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (target === null) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  return target === null ? null : Math.max(0, Math.ceil((target - now) / 1000));
}
