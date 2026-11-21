"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useRef, type AnchorHTMLAttributes } from "react";

type IntentLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>;

/**
 * Link that prefetches on intent (hover, touch, keyboard focus) instead of as
 * soon as it scrolls into view. Pages with many links (nav board list, latest
 * posts, thread lists, catalog) otherwise fire 100+ prefetch requests per page
 * view, which competes with the actual navigation and costs a function call each.
 */
export const IntentLink = forwardRef<HTMLAnchorElement, IntentLinkProps>(function IntentLink(
  { href, onMouseEnter, onTouchStart, onFocus, ...props },
  ref,
) {
  const router = useRouter();
  const done = useRef(false);
  const prefetch = () => {
    if (done.current) return;
    done.current = true;
    const url = typeof href === "string" ? href : href.pathname ?? "";
    if (url) router.prefetch(url);
  };

  return (
    <Link
      ref={ref}
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        prefetch();
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        prefetch();
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        prefetch();
        onFocus?.(e);
      }}
      {...props}
    />
  );
});
