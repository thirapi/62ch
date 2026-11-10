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
  const [secondsLeft, setSecondsLeft] = useState(BASE_INTERVAL_S);
  const [state, setState] = useState<AutoUpdateState>("idle");

  const intervalRef = useRef(BASE_INTERVAL_S);
  const knownRef = useRef({ count: knownReplyCount, isLocked, isArchived });
  const checkingRef = useRef(false);

  // Props are the source of truth after every refresh
  useEffect(() => {
    knownRef.current = { count: knownReplyCount, isLocked, isArchived };
  }, [knownReplyCount, isLocked, isArchived]);

  const scheduleNext = useCallback((seconds: number) => {
    const hidden = typeof document !== "undefined" && document.hidden;
    setSecondsLeft(hidden ? Math.max(seconds, HIDDEN_MIN_INTERVAL_S) : seconds);
  }, []);

  const check = useCallback(
    async (manual = false) => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      setState("checking");
      try {
        const status = await getThreadStatus(threadId);
        if (!status) {
          setState("gone");
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
        scheduleNext(intervalRef.current);
      } catch {
        setState("idle");
        scheduleNext(MAX_INTERVAL_S);
      } finally {
        checkingRef.current = false;
      }
    },
    [threadId, router, scheduleNext],
  );

  // One-second ticker drives both the countdown label and the actual poll
  useEffect(() => {
    if (!enabled || state === "gone") return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [enabled, state]);

  useEffect(() => {
    if (enabled && state === "idle" && secondsLeft === 0) {
      void check();
    }
  }, [enabled, state, secondsLeft, check]);

  // Coming back to the tab: check soon instead of waiting out a long backoff
  useEffect(() => {
    if (!enabled) return;
    const onVisible = () => {
      if (!document.hidden) {
        intervalRef.current = BASE_INTERVAL_S;
        setSecondsLeft((s) => Math.min(s, 2));
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [enabled]);

  // Re-enabling restarts the cycle
  useEffect(() => {
    if (enabled) {
      intervalRef.current = BASE_INTERVAL_S;
      setSecondsLeft(BASE_INTERVAL_S);
    }
  }, [enabled]);

  const updateNow = useCallback(() => {
    intervalRef.current = BASE_INTERVAL_S;
    void check(true);
  }, [check]);

  return {
    secondsLeft,
    isChecking: state === "checking" || isRefreshing,
    isGone: state === "gone",
    updateNow,
  };
}
