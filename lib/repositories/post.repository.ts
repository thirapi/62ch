import { db } from "@/lib/db"
import { threads, replies, boards } from "@/lib/db/schema"
import { desc, eq, isNotNull, and, sql, count, gt, lt } from "drizzle-orm"
import type { LatestPostEntity, RecentImageEntity, PostInfoEntity } from "@/lib/entities/post.entity"
import type { SystemStatsEntity } from "@/lib/entities/stats.entity"

export class PostRepository {
  async getLatestPosts(limit = 10, beforeDate?: Date): Promise<LatestPostEntity[]> {
    const threadWhere = beforeDate 
      ? and(eq(threads.isDeleted, false), lt(threads.createdAt, beforeDate))
      : eq(threads.isDeleted, false)

    const latestThreads = await db
      .select({
        id: threads.id,
        postNumber: threads.postNumber,
        subject: threads.subject,
        content: threads.content,
        image: threads.image,
        createdAt: threads.createdAt,
        boardCode: boards.code,
        capcode: threads.capcode,
      })
      .from(threads)
      .innerJoin(boards, eq(threads.boardId, boards.id))
      .where(threadWhere)
      .orderBy(desc(threads.createdAt))
      .limit(limit)

    const replyWhere = beforeDate
      ? and(
          eq(replies.isDeleted, false),
          eq(threads.isDeleted, false),
          lt(replies.createdAt, beforeDate)
        )
      : and(
          eq(replies.isDeleted, false),
          eq(threads.isDeleted, false)
        )

    const latestReplies = await db
      .select({
        id: replies.id,
        postNumber: replies.postNumber,
        content: replies.content,
        createdAt: replies.createdAt,
        threadId: replies.threadId,
        boardCode: boards.code,
        capcode: replies.capcode,
        threadSubject: threads.subject,
        threadContent: threads.content,
        threadImage: threads.image,
      })
      .from(replies)
      .innerJoin(threads, eq(replies.threadId, threads.id))
      .innerJoin(boards, eq(threads.boardId, boards.id))
      .where(replyWhere)
      .orderBy(desc(replies.createdAt))
      .limit(limit)

    const posts: LatestPostEntity[] = []

    for (const t of latestThreads) {
      posts.push({
        id: t.id,
        postNumber: t.postNumber as number,
        type: "thread",
        title: t.subject,
        excerpt: t.content.substring(0, 200),
        createdAt: t.createdAt!,
        boardCode: t.boardCode,
        threadId: t.id,
        capcode: t.capcode,
        threadSubject: t.subject,
        threadExcerpt: t.content.substring(0, 150),
        threadImage: t.image,
      })
    }

    for (const r of latestReplies) {
      posts.push({
        id: r.id,
        postNumber: r.postNumber as number,
        type: "reply",
        title: null,
        excerpt: r.content.substring(0, 200),
        createdAt: r.createdAt!,
        boardCode: r.boardCode,
        threadId: r.threadId,
        capcode: r.capcode,
        threadSubject: r.threadSubject,
        threadExcerpt: r.threadContent ? r.threadContent.substring(0, 150) : null,
        threadImage: r.threadImage,
      })
    }

    return posts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  async getRecentImages(limit = 12): Promise<RecentImageEntity[]> {
    const threadImages = await db
      .select({
        id: threads.id,
        postNumber: threads.postNumber,
        imageUrl: threads.image,
        createdAt: threads.createdAt,
        boardCode: boards.code,
        threadId: threads.id,
        isNsfw: threads.isNsfw,
        isSpoiler: threads.isSpoiler,
        threadSubject: threads.subject,
        threadContent: threads.content,
      })
      .from(threads)
      .innerJoin(boards, eq(threads.boardId, boards.id))
      .where(
        and(
          eq(threads.isDeleted, false),
          isNotNull(threads.image),
        )
      )
      .orderBy(desc(threads.createdAt))
      .limit(limit)

    const replyImages = await db
      .select({
        id: replies.id,
        postNumber: replies.postNumber,
        imageUrl: replies.image,
        createdAt: replies.createdAt,
        boardCode: boards.code,
        threadId: replies.threadId,
        isNsfw: replies.isNsfw,
        isSpoiler: replies.isSpoiler,
        threadSubject: threads.subject,
        threadContent: threads.content,
      })
      .from(replies)
      .innerJoin(threads, eq(replies.threadId, threads.id))
      .innerJoin(boards, eq(threads.boardId, boards.id))
      .where(
        and(
          eq(replies.isDeleted, false),
          eq(threads.isDeleted, false),
          isNotNull(replies.image),
        )
      )
      .orderBy(desc(replies.createdAt))
      .limit(limit)

    const images: RecentImageEntity[] = []

    for (const t of threadImages) {
      images.push({
        id: t.id,
        postNumber: t.postNumber as number,
        imageUrl: t.imageUrl!,
        createdAt: t.createdAt!,
        boardCode: t.boardCode,
        threadId: t.threadId,
        isNsfw: t.isNsfw ?? false,
        isSpoiler: t.isSpoiler ?? false,
        threadSubject: t.threadSubject,
        threadExcerpt: t.threadContent ? t.threadContent.substring(0, 150) : null,
      })
    }

    for (const r of replyImages) {
      images.push({
        id: r.id,
        postNumber: r.postNumber as number,
        imageUrl: r.imageUrl!,
        createdAt: r.createdAt!,
        boardCode: r.boardCode,
        threadId: r.threadId,
        isNsfw: r.isNsfw ?? false,
        isSpoiler: r.isSpoiler ?? false,
        threadSubject: r.threadSubject,
        threadExcerpt: r.threadContent ? r.threadContent.substring(0, 150) : null,
      })
    }

    return images
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  async findByPostNumber(postNumber: number): Promise<PostInfoEntity | null> {
    // Check threads first
    const thread = await db
      .select({
        id: threads.id,
        postNumber: threads.postNumber,
        content: threads.content,
        author: threads.author,
        createdAt: threads.createdAt,
        image: threads.image,
        boardCode: boards.code,
        isNsfw: threads.isNsfw,
        isSpoiler: threads.isSpoiler,
        capcode: threads.capcode,
      })
      .from(threads)
      .innerJoin(boards, eq(threads.boardId, boards.id))
      .where(
        and(
          eq(threads.postNumber, postNumber),
          eq(threads.isDeleted, false),
        )
      )
      .limit(1)

    if (thread.length > 0) {
      return {
        id: thread[0].id,
        postNumber: thread[0].postNumber as number,
        content: thread[0].content,
        author: thread[0].author!,
        createdAt: thread[0].createdAt!,
        image: thread[0].image,
        boardCode: thread[0].boardCode,
        type: "thread",
        threadId: thread[0].id,
        isNsfw: thread[0].isNsfw ?? false,
        isSpoiler: thread[0].isSpoiler ?? false,
        capcode: thread[0].capcode,
      }
    }

    // Check replies
    const reply = await db
      .select({
        id: replies.id,
        postNumber: replies.postNumber,
        content: replies.content,
        author: replies.author,
        createdAt: replies.createdAt,
        image: replies.image,
        threadId: replies.threadId,
        boardCode: boards.code,
        isNsfw: replies.isNsfw,
        isSpoiler: replies.isSpoiler,
        capcode: replies.capcode,
      })
      .from(replies)
      .innerJoin(threads, eq(replies.threadId, threads.id))
      .innerJoin(boards, eq(threads.boardId, boards.id))
      .where(
        and(
          eq(replies.postNumber, postNumber),
          eq(replies.isDeleted, false),
          eq(threads.isDeleted, false),
        )
      )
      .limit(1)

    if (reply.length > 0) {
      return {
        id: reply[0].id,
        postNumber: reply[0].postNumber as number,
        content: reply[0].content,
        author: reply[0].author!,
        createdAt: reply[0].createdAt!,
        image: reply[0].image,
        threadId: reply[0].threadId,
        boardCode: reply[0].boardCode,
        type: "reply",
        isNsfw: reply[0].isNsfw ?? false,
        isSpoiler: reply[0].isSpoiler ?? false,
        capcode: reply[0].capcode,
      }
    }

    return null
  }

  async getSystemStats(): Promise<SystemStatsEntity> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [threadCount] = await db.select({ value: count() }).from(threads).where(eq(threads.isDeleted, false))
    const [replyCount] = await db.select({ value: count() }).from(replies).where(eq(replies.isDeleted, false))

    const [threadsToday] = await db
      .select({ value: count() })
      .from(threads)
      .where(
        and(
          gt(threads.createdAt, twentyFourHoursAgo),
          eq(threads.isDeleted, false)
        )
      )

    const [repliesToday] = await db
      .select({ value: count() })
      .from(replies)
      .where(
        and(
          gt(replies.createdAt, twentyFourHoursAgo),
          eq(replies.isDeleted, false)
        )
      )

    const [threadImages] = await db
      .select({ value: count() })
      .from(threads)
      .where(
        and(
          isNotNull(threads.image),
          eq(threads.isDeleted, false)
        )
      )

    const [replyImages] = await db
      .select({ value: count() })
      .from(replies)
      .where(
        and(
          isNotNull(replies.image),
          eq(replies.isDeleted, false)
        )
      )

    // Active Threads: Unique thread IDs that had activity (created or replied to) in last 24h
    // Only count threads that are not deleted
    const tActive = await db
      .select({ id: threads.id })
      .from(threads)
      .where(
        and(
          gt(threads.createdAt, twentyFourHoursAgo),
          eq(threads.isDeleted, false)
        )
      )

    const rActive = await db
      .select({ threadId: replies.threadId })
      .from(replies)
      .innerJoin(threads, eq(replies.threadId, threads.id)) // Ensure parent thread not deleted too
      .where(
        and(
          gt(replies.createdAt, twentyFourHoursAgo),
          eq(replies.isDeleted, false),
          eq(threads.isDeleted, false)
        )
      )

    const activeThreadIds = new Set()
    tActive.forEach((t) => activeThreadIds.add(t.id))
    rActive.forEach((r) => activeThreadIds.add(r.threadId))

    return {
      totalPosts: Number(threadCount.value) + Number(replyCount.value),
      postsToday: Number(threadsToday.value) + Number(repliesToday.value),
      totalImages: Number(threadImages.value) + Number(replyImages.value),
      activeThreads24h: activeThreadIds.size,
    }
  }
}
