"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Start every new page at the very top.
 *
 * Next.js only scrolls the changed segment into view, which leaves the page
 * 30-ish px down (under the board nav) and, when the previous page was long and
 * the next one renders through a loading skeleton (catalog -> thread), does not
 * reset at all, so a thread could open halfway or at the bottom.
 *
 * Skipped for back/forward (the browser/Next restores the old position) and for
 * URLs with a #pN hash (the thread page scrolls to that post itself).
 * Only a new path, board page number or view counts as a new page; sort and
 * search keep their place.
 */
export function ScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}|${searchParams.get("page") ?? ""}|${searchParams.get("view") ?? ""}`;

  const prevKey = useRef(key);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPop = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (prevKey.current === key) return;
    prevKey.current = key;
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [key]);

  return null;
}
