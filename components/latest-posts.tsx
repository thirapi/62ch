"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { FormattedText } from "@/components/formatted-text"
import { getLatestPosts } from "@/lib/actions/home.actions"
import type { LatestPostEntity } from "@/lib/entities/post.entity"

interface LatestPostsProps {
  initialPosts: LatestPostEntity[]
}

export function LatestPosts({ initialPosts }: LatestPostsProps) {
  const [posts, setPosts] = useState<LatestPostEntity[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10) // Assume limit is 10
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingIndicatorRef = useRef<HTMLDivElement | null>(null)

  // Update state when initialPosts changes (e.g. from router.refresh())
  useEffect(() => {
    setPosts(initialPosts)
    setHasMore(initialPosts.length >= 10)
  }, [initialPosts])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || posts.length === 0) return

    setIsLoading(true)
    try {
      // Get the last post's date explicitly without relying on sorting again here if possible
      // though the array is sorted, let's just use the last element
      const lastPost = posts[posts.length - 1]
      const beforeDate = new Date(lastPost.createdAt)
      
      const newPosts = await getLatestPosts(10, beforeDate)
      
      if (newPosts && newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts])
        setHasMore(newPosts.length === 10)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more posts:", error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, posts])

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && !isLoading && hasMore) {
        loadMore()
      }
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px", // Load slightly before reaching the bottom
      threshold: 0,
    })

    if (loadingIndicatorRef.current) {
      observerRef.current.observe(loadingIndicatorRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, isLoading, hasMore])

  if (posts.length === 0) return null

  return (
    <section className="lg:col-span-5 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-3 text-accent border-b pb-1">
        Postingan Terbaru
      </h2>
      
      <div className="space-y-2 flex-col flex flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
        {posts.map((post) => (
          <Link
            key={`latest-${post.id}-${post.type}`}
            href={`/${post.boardCode}/thread/${post.threadId}#p${post.postNumber}`}
            className="block text-sm hover:bg-accent/5 p-2 rounded transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate text-xs">
                  {post.title || (
                    <span className="text-muted-foreground italic">
                      {post.type === "thread" ? "Utas" : "Balasan"}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  <FormattedText content={post.excerpt} preview />
                </div>
              </div>
              <span className="text-[10px] font-mono text-accent font-bold whitespace-nowrap">
                /{post.boardCode}/
              </span>
            </div>
          </Link>
        ))}
        
        {/* Loading Indicator & Observer Target */}
        {hasMore && (
          <div 
            ref={loadingIndicatorRef} 
            className="py-6 flex justify-center items-center opacity-70"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="animate-pulse">Memuat...</span>
            </div>
          </div>
        )}
        
        {!hasMore && posts.length > 0 && (
          <div className="py-4 text-center text-[10px] font-mono text-muted-foreground/50">
            [ Akhir dari postingan terbaru ]
          </div>
        )}
      </div>
    </section>
  )
}
