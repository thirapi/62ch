"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: Date | string;
  className?: string;
  compact?: boolean;
}

export function FormattedDate({ date, className, compact }: FormattedDateProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (compact) {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const yy = d.getFullYear().toString().slice(-2);
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      setFormatted(`${mm}/${dd}/${yy} ${hh}:${min}`);
    } else {
      setFormatted(d.toLocaleString());
    }
  }, [date, compact]);

  // Return an empty span or a placeholder during SSR to prevent hydration mismatch
  if (!formatted) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{formatted}</span>;
}
