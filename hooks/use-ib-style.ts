"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import { IB_STYLES, IB_STYLE_KEY as KEY, type IbStyle } from "@/lib/ib-style";

export { IB_STYLES };
export type { IbStyle };

const listeners = new Set<() => void>();

function read(): IbStyle {
  const v = typeof document !== "undefined" ? document.documentElement.dataset.style : undefined;
  return (IB_STYLES.some((s) => s.id === v) ? v : "hijau") as IbStyle;
}

export function useIbStyle() {
  const { setTheme } = useTheme();
  const style = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => "hijau" as IbStyle,
  );

  const setStyle = useCallback(
    (next: IbStyle) => {
      const root = document.documentElement;
      if (next === "hijau") delete root.dataset.style;
      else root.dataset.style = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      // Classic styles have a fixed light/dark scheme; 62 Hijau follows the system.
      setTheme(next === "tomorrow" ? "dark" : next === "hijau" ? "system" : "light");
      listeners.forEach((l) => l());
    },
    [setTheme],
  );

  return { style, setStyle };
}
