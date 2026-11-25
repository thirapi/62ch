"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: Date | string;
  className?: string;
  compact?: boolean;
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * Fixed imageboard-style format, independent of the browser locale:
 *   full:    21/11/26 (Sab) 23:18:05
 *   compact: 21/11/26 23:18
 * Formatted on the client so it uses the viewer's timezone.
 */
export function formatPostDate(d: Date, compact = false): string {
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear().toString().slice(-2)}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (compact) return `${date} ${time}`;
  return `${date} (${DAYS[d.getDay()]}) ${time}:${pad(d.getSeconds())}`;
}

export function FormattedDate({ date, className, compact }: FormattedDateProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    const d = typeof date === "string" ? new Date(date) : date;
    setFormatted(formatPostDate(d, compact));
  }, [date, compact]);

  // Return a placeholder during SSR to prevent hydration mismatch
  if (!formatted) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{formatted}</span>;
}
