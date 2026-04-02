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
        excerpt: sql<string>`left(${threads.content}, 200)`,
        image: threads.image,
        createdAt: threads.createdAt,
        boardCode: boards.code,
        capcode: threads.capcode,
        isNsfw: threads.isNsfw,
        isSpoiler: threads.isSpoiler,
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
        excerpt: sql<string>`left(${replies.content}, 200)`,
        createdAt: replies.createdAt,
        threadId: replies.threadId,
        boardCode: boards.code,
        capcode: replies.capcode,
        threadSubject: threads.subject,
        threadExcerpt: sql<string>`left(${threads.content}, 150)`,
        threadImage: threads.image,
        isNsfw: replies.isNsfw,
        isSpoiler: replies.isSpoiler,
        threadIsNsfw: threads.isNsfw,
        threadIsSpoiler: threads.isSpoiler,
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
        excerpt: t.excerpt,
        createdAt: t.createdAt!,
        boardCode: t.boardCode,
        threadId: t.id,
        capcode: t.capcode,
        threadSubject: t.subject,
        threadExcerpt: t.excerpt.substring(0, 150),
        threadImage: t.image,
        isNsfw: t.isNsfw ?? false,
        isSpoiler: t.isSpoiler ?? false,
      })
    }

    for (const r of latestReplies) {
      posts.push({
        id: r.id,
        postNumber: r.postNumber as number,
        type: "reply",
        title: null,
        excerpt: r.excerpt,
        createdAt: r.createdAt!,
        boardCode: r.boardCode,
        threadId: r.threadId,
        capcode: r.capcode,
        threadSubject: r.threadSubject,
        threadExcerpt: r.threadExcerpt,
        threadImage: r.threadImage,
        isNsfw: (r.isNsfw || r.threadIsNsfw) ?? false,
        isSpoiler: (r.isSpoiler || r.threadIsSpoiler) ?? false,
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
        threadExcerpt: sql<string>`left(${threads.content}, 150)`,
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
        threadExcerpt: sql<string>`left(${threads.content}, 150)`,
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
        threadExcerpt: t.threadExcerpt,
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
        threadExcerpt: r.threadExcerpt,
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

    try {
      const [
        totalRes,
        threadsTodayRes,
        repliesTodayRes,
        imagesRes,
        replyImagesRes,
        activeThreadsRes
      ] = await Promise.allSettled([
        // 1. Total - Pakai estimasi (Instan)
        db.execute(sql`
          SELECT (reltuples::bigint) as count FROM pg_class WHERE relname = 'threads'
          UNION ALL
          SELECT (reltuples::bigint) as count FROM pg_class WHERE relname = 'replies'
        `),
        // 2. Threads Today
        db.select({ value: count() }).from(threads).where(and(gt(threads.createdAt, twentyFourHoursAgo), eq(threads.isDeleted, false))),
        // 3. Replies Today
        db.select({ value: count() }).from(replies).where(and(gt(replies.createdAt, twentyFourHoursAgo), eq(replies.isDeleted, false))),
        // 3. Total Gambar (Hitung postingan yang punya gambar)
        db.select({ value: count() }).from(threads).where(and(isNotNull(threads.image), eq(threads.isDeleted, false))),
        db.select({ value: count() }).from(replies).where(and(isNotNull(replies.image), eq(replies.isDeleted, false))),
        // 4. Active Threads (Gabungkan dua query select secara legal di Drizzle)
        db.select({ value: count() }).from(
          db.select({ threadId: threads.id }).from(threads).where(and(gt(threads.createdAt, twentyFourHoursAgo), eq(threads.isDeleted, false)))
          .union(
            db.select({ threadId: replies.threadId }).from(replies).where(and(gt(replies.createdAt, twentyFourHoursAgo), eq(replies.isDeleted, false)))
          ).as('active_ids')
        )
      ])

      const totalPosts = totalRes.status === 'fulfilled' 
        ? (totalRes.value as any).reduce((acc: number, row: any) => acc + Number(row.count || 0), 0)
        : 0

      const postsToday = (threadsTodayRes.status === 'fulfilled' ? Number(threadsTodayRes.value[0].value) : 0) + 
                         (repliesTodayRes.status === 'fulfilled' ? Number(repliesTodayRes.value[0].value) : 0)
      
      const totalImages = (imagesRes.status === 'fulfilled' ? Number(imagesRes.value[0].value) : 0) + 
                          (replyImagesRes.status === 'fulfilled' ? Number(replyImagesRes.value[0].value) : 0)

      const activeCountRow = activeThreadsRes.status === 'fulfilled' ? (activeThreadsRes.value[0] as any) : null
      const activeCount = Number(activeCountRow?.value || 0)

      return {
        totalPosts,
        postsToday,
        totalImages,
        activeThreads24h: activeCount,
      }
    } catch (error) {
      console.error("Error in getSystemStats:", error)
      return { totalPosts: 0, postsToday: 0, totalImages: 0, activeThreads24h: 0 }
    }
  }
}
