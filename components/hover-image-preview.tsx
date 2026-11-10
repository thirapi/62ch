"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 16;
const EDGE = 8;

interface HoverImagePreviewProps {
  src: string;
  x: number;
  y: number;
  /** Natural size from metadata, when known, so we can place it before it loads. */
  width?: number;
  height?: number;
}

/** Full-size image that follows the cursor while hovering a thumbnail (desktop only). */
export function HoverImagePreview({ src, x, y, width, height }: HoverImagePreviewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const placeLeft = x > vw / 2;
  const availW = (placeLeft ? x : vw - x) - GAP - EDGE;
  const availH = vh - EDGE * 2;

  let style: React.CSSProperties;
  if (width && height) {
    const scale = Math.min(1, availW / width, availH / height);
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    style = {
      width: w,
      height: h,
      left: placeLeft ? x - GAP - w : x + GAP,
      top: Math.min(Math.max(y - h / 2, EDGE), vh - h - EDGE),
    };
  } else {
    style = {
      maxWidth: availW,
      maxHeight: availH,
      top: EDGE,
      ...(placeLeft ? { right: vw - x + GAP } : { left: x + GAP }),
    };
  }

  return createPortal(
    <img
      src={src}
      alt=""
      aria-hidden
      className="fixed z-[60] pointer-events-none object-contain rounded-sm border border-border bg-background shadow-2xl"
      style={style}
    />,
    document.body,
  );
}
