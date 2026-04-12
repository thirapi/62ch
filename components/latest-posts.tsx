"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { FormattedText } from "@/components/formatted-text"
import { getLatestPosts } from "@/lib/actions/home.actions"
import type { LatestPostEntity } from "@/lib/entities/post.entity"
import { ThreadPreview } from "@/components/thread-preview"
import { VerifiedLink } from "@/components/verified-link"

interface LatestPostsProps {
  initialPosts: LatestPostEntity[]
  isMobile: boolean
}

export function LatestPosts({ initialPosts, isMobile }: LatestPostsProps) {
  const [posts, setPosts] = useState<LatestPostEntity[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  
  const LIMIT = isMobile ? 20 : 25
  const [hasMore, setHasMore] = useState(initialPosts.length >= LIMIT)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingIndicatorRef = useRef<HTMLDivElement | null>(null)

  // Update state when initialPosts changes (e.g. from router.refresh())
  useEffect(() => {
    setPosts(initialPosts)
    setHasMore(initialPosts.length >= LIMIT)
  }, [initialPosts])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || posts.length === 0) return

    setIsLoading(true)
    try {
      // Get the last post's date explicitly without relying on sorting again here if possible
      // though the array is sorted, let's just use the last element
      const lastPost = posts[posts.length - 1]
      const beforeDate = new Date(lastPost.createdAt)
      
      const newPosts = await getLatestPosts(LIMIT, beforeDate)
      
      if (newPosts && newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts])
        setHasMore(newPosts.length === LIMIT)
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
      <h2 className="text-lg font-semibold mb-3 text-accent border-b pb-1">
        Postingan Terbaru
      </h2>
      
      <div className="relative flex-1">
        <div className="space-y-0.5 flex-col flex overflow-y-auto max-h-[440px] sm:max-h-[642px] pr-2 custom-scrollbar">

        {posts.map((post) => (
          <ThreadPreview
            key={`preview-${post.id}-${post.type}`}
            subject={post.threadSubject}
            excerpt={post.threadExcerpt}
            image={post.threadImage}
            boardCode={post.boardCode}
            isNsfw={post.isNsfw}
            isSpoiler={post.isSpoiler}
          >
            <VerifiedLink
              key={`latest-${post.id}-${post.type}`}
              href={`/${post.boardCode}/thread/${post.threadId}#p${post.postNumber}`}
              className="block text-sm hover:bg-accent/5 px-2 py-0.5 rounded transition-colors w-full"
            >
              <div className="flex items-start gap-1">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                    <span className="text-[10px] font-mono font-bold text-accent mr-1">
                      /{post.boardCode}/:
                    </span>
                    {post.title ? (
                      <span className="font-medium text-foreground mr-1">
                        {post.title}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70 italic mr-1 text-[10px]">
                        [{post.type === "thread" ? "Utas" : "Balasan"}]
                      </span>
                    )}
                    <span className="opacity-90">
                      <FormattedText content={post.excerpt} preview />
                    </span>
                  </div>
                </div>
              </div>
            </VerifiedLink>
          </ThreadPreview>
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
            [ akhir dari postingan terbaru wan]
          </div>
        )}
        </div>

        {/* Fade gradient hint */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
      </div>
    </section>
  )
}
