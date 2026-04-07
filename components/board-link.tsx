"use client";

import Link from "next/link";
import { useNav } from "./nav-provider";
import { ReactNode } from "react";

interface BoardLinkProps {
  boardCode: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

import { VerifiedLink } from "./verified-link";

interface BoardLinkProps {
  boardCode: string;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function BoardLink({ boardCode, children, className, title }: BoardLinkProps) {
  const { defaultBoardView } = useNav();

  const url = defaultBoardView === "catalog" 
    ? `/${boardCode}?view=catalog` 
    : `/${boardCode}`;

  return (
    <VerifiedLink href={url} className={className} title={title}>
      {children}
    </VerifiedLink>
  );
}
