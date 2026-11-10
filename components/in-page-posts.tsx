"use client";

import { createContext, useContext } from "react";
import type { PostInfoEntity } from "@/lib/entities/post.entity";

/**
 * Posts already rendered on the current page, keyed by post number. Quote
 * previews (>>123) read from here first and only hit the server for posts
 * that live in other threads.
 */
const InPagePostsContext = createContext<ReadonlyMap<number, PostInfoEntity> | null>(null);

export const InPagePostsProvider = InPagePostsContext.Provider;

export function useInPagePost(postNumber: number): PostInfoEntity | null {
  return useContext(InPagePostsContext)?.get(postNumber) ?? null;
}
