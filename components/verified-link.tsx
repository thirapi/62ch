"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { useAgeVerification } from "./age-verification-provider";

interface VerifiedLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onBeforeNavigate?: () => void;
}

export function VerifiedLink({ 
  children, 
  href, 
  onClick, 
  onBeforeNavigate,
  ...props 
}: VerifiedLinkProps) {
  const { isVerified, setIsOpen, setPendingPath } = useAgeVerification();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's an external link or not a board/thread link, just let it be
    // But usually we use this for internal board links
    const hrefString = typeof href === "string" ? href : href.pathname || "";
    
    // Check if the destination is a "restricted" path
    const isRestricted = hrefString !== "/" && 
                        !hrefString.startsWith("/rules") && 
                        !hrefString.startsWith("/donasi") &&
                        !hrefString.startsWith("/mod");

    if (isRestricted && !isVerified) {
      e.preventDefault();
      setPendingPath(hrefString);
      setIsOpen(true);
      if (onBeforeNavigate) onBeforeNavigate();
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
