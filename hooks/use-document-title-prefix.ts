"use client";

import { useEffect } from "react";

const PREFIX_RE = /^\(\d+\+?\)\s/;

/**
 * Shows an unread counter in the tab title, e.g. "(3) Judul thread".
 * Next.js rewrites <title> on router.refresh(), so we watch it and re-apply.
 */
export function useDocumentTitleCount(count: number) {
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(PREFIX_RE, "");
      const next = count > 0 ? `(${count > 99 ? "99+" : count}) ${base}` : base;
      if (document.title !== next) document.title = next;
    };
    apply();

    const titleEl = document.querySelector("title");
    if (!titleEl) return;
    const observer = new MutationObserver(apply);
    observer.observe(titleEl, { childList: true, characterData: true, subtree: true });
    return () => {
      observer.disconnect();
      document.title = document.title.replace(PREFIX_RE, "");
    };
  }, [count]);
}
