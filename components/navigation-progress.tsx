"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Dispatch from code that navigates with router.push (sort, view toggle). */
export const NAV_START_EVENT = "ib:navstart";

export function startNavigationProgress() {
  window.dispatchEvent(new Event(NAV_START_EVENT));
}

/** Dispatch when a click that looked like navigation was blocked (age gate). */
export const NAV_CANCEL_EVENT = "ib:navcancel";

export function cancelNavigationProgress() {
  window.dispatchEvent(new Event(NAV_CANCEL_EVENT));
}

type Phase = "idle" | "loading" | "done";

/**
 * Thin progress bar at the top of the page that appears the moment an internal
 * link is clicked, so the click gets visible feedback (< 100 ms) even while the
 * next page is still being rendered on the server.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [width, setWidth] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    const start = () => {
      clearTimers();
      setPhase("loading");
      setWidth(0);
      // Next frame: jump to 25%, then creep towards 85% while waiting.
      requestAnimationFrame(() => setWidth(25));
      timers.current.push(setTimeout(() => setWidth(85), 120));
      // Safety net: never stay stuck if a navigation is cancelled.
      timers.current.push(setTimeout(() => setPhase("done"), 10000));
    };

    const cancel = () => {
      clearTimers();
      setPhase("idle");
      setWidth(0);
    };

    // Capture phase: runs before Next's <Link> handler, which always calls
    // preventDefault for client-side navigation. Links that really block the
    // navigation (age gate) dispatch NAV_CANCEL_EVENT instead.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download")) return;
      if (a.target && a.target !== "_self") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (or hash-only jump): nothing to load.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener(NAV_START_EVENT, start);
    window.addEventListener(NAV_CANCEL_EVENT, cancel);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAV_START_EVENT, start);
      window.removeEventListener(NAV_CANCEL_EVENT, cancel);
      clearTimers();
    };
  }, []);

  // The URL changed: the new page is rendering, finish the bar.
  useEffect(() => {
    setPhase((p) => (p === "loading" ? "done" : p));
  }, [pathname, searchParams]);

  useEffect(() => {
    if (phase !== "done") return;
    clearTimers();
    setWidth(100);
    const t = setTimeout(() => {
      setPhase("idle");
      setWidth(0);
    }, 250);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px]"
    >
      <div
        className="h-full bg-accent"
        style={{
          width: `${width}%`,
          opacity: phase === "done" ? 0 : 1,
          transition:
            phase === "done"
              ? "width 150ms ease-out, opacity 200ms ease 100ms"
              : width >= 85
                ? "width 8s cubic-bezier(0.1, 0.6, 0.2, 1)"
                : "width 200ms ease-out",
        }}
      />
    </div>
  );
}
