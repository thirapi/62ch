import { db } from "@/lib/db"
import { threads, replies, boards } from "@/lib/db/schema"
import { desc, eq, isNotNull, and, sql, count, gt, lt } from "drizzle-orm"
import type { LatestPostEntity, RecentImageEntity, PostInfoEntity } from "@/lib/entities/post.entity"
import type { SystemStatsEntity } from "@/lib/entities/stats.entity"

export class PostRepository {
  async getLatestPosts(limit = 10, beforeDate?: Date): Promise<LatestPostEntity[]> {
    // Using raw SQL for UNION ALL to ensure efficiency and correct sorting at DB level
    const before = beforeDate?.toISOString()
    const result = await db.execute(sql`
      WITH combined_posts AS (
        SELECT 
          t.id, 
          t.post_number as "postNumber", 
          'thread' as "type", 
          t.subject as "title", 
          left(t.content, 200) as "excerpt", 
          t.created_at as "createdAt", 
          b.code as "boardCode", 
          t.id as "threadId", 
          t.capcode, 
          t.subject as "threadSubject", 
          left(t.content, 150) as "threadExcerpt", 
          t.image as "threadImage",
          COALESCE(t.is_nsfw, false) as "isNsfw",
          COALESCE(t.is_spoiler, false) as "isSpoiler"
        FROM ${threads} t
        INNER JOIN ${boards} b ON t.board_id = b.id
        WHERE t.is_deleted = false ${before ? sql`AND t.created_at < ${before}` : sql``}
        
        UNION ALL
        
        SELECT 
          r.id, 
          r.post_number as "postNumber", 
          'reply' as "type", 
          NULL as "title", 
          left(r.content, 200) as "excerpt", 
          r.created_at as "createdAt", 
          b.code as "boardCode", 
          r.thread_id as "threadId", 
          r.capcode, 
          t.subject as "threadSubject", 
          left(t.content, 150) as "threadExcerpt", 
          t.image as "threadImage",
          COALESCE(r.is_nsfw OR t.is_nsfw, false) as "isNsfw",
          COALESCE(r.is_spoiler OR t.is_spoiler, false) as "isSpoiler"
        FROM ${replies} r
        INNER JOIN ${threads} t ON r.thread_id = t.id
        INNER JOIN ${boards} b ON t.board_id = b.id
        WHERE r.is_deleted = false AND t.is_deleted = false ${before ? sql`AND r.created_at < ${before}` : sql``}
      )
      SELECT * FROM combined_posts
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `)

    return (result as any).map((row: any) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      postNumber: Number(row.postNumber)
    }))
  }

  async getRecentImages(limit = 12): Promise<RecentImageEntity[]> {
    const result = await db.execute(sql`
      WITH combined_images AS (
        SELECT 
          t.id, 
          t.post_number as "postNumber", 
          t.image as "imageUrl", 
          t.created_at as "createdAt", 
          b.code as "boardCode", 
          t.id as "threadId", 
          COALESCE(t.is_nsfw, false) as "isNsfw", 
          COALESCE(t.is_spoiler, false) as "isSpoiler", 
          t.subject as "threadSubject", 
          left(t.content, 150) as "threadExcerpt"
        FROM ${threads} t
        INNER JOIN ${boards} b ON t.board_id = b.id
        WHERE t.is_deleted = false AND t.image IS NOT NULL
        
        UNION ALL
        
        SELECT 
          r.id, 
          r.post_number as "postNumber", 
          r.image as "imageUrl", 
          r.created_at as "createdAt", 
          b.code as "boardCode", 
          r.thread_id as "threadId", 
          COALESCE(r.is_nsfw, false) as "isNsfw", 
          COALESCE(r.is_spoiler, false) as "isSpoiler", 
          t.subject as "threadSubject", 
          left(t.content, 150) as "threadExcerpt"
        FROM ${replies} r
        INNER JOIN ${threads} t ON r.thread_id = t.id
        INNER JOIN ${boards} b ON t.board_id = b.id
        WHERE r.is_deleted = false AND t.is_deleted = false AND r.image IS NOT NULL
      )
      SELECT * FROM combined_images
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `)

    return (result as any).map((row: any) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      postNumber: Number(row.postNumber)
    }))
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
    // Percepat build: Jangan hitung stats jika sedang dalam fase build statis Vercel
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return { totalPosts: 0, postsToday: 0, totalImages: 0, activeThreads24h: 0 };
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    try {
      const [
        totalThreadsRes,
        totalRepliesRes,
        threadsTodayRes,
        repliesTodayRes,
        imagesRes,
        replyImagesRes,
        activeThreadsRes
      ] = await Promise.allSettled([
        // 1. Total (Akurat)
        db.select({ value: count() }).from(threads).where(eq(threads.isDeleted, false)),
        db.select({ value: count() }).from(replies).where(eq(replies.isDeleted, false)),
        // 2. Threads Today (Penyaringan berdasarkan index createdAt - Cepat)
        db.select({ value: count() }).from(threads).where(and(gt(threads.createdAt, twentyFourHoursAgo), eq(threads.isDeleted, false))),
        // 3. Replies Today (Penyaringan berdasarkan index createdAt - Cepat)
        db.select({ value: count() }).from(replies).where(and(gt(replies.createdAt, twentyFourHoursAgo), eq(replies.isDeleted, false))),
        // 3. Total Gambar (Ini yang berat - dijalankan paralel)
        db.select({ value: count() }).from(threads).where(and(isNotNull(threads.image), eq(threads.isDeleted, false))),
        db.select({ value: count() }).from(replies).where(and(isNotNull(replies.image), eq(replies.isDeleted, false))),
        // 4. Active Threads
        db.select({ value: count() }).from(
          db.select({ threadId: threads.id }).from(threads).where(and(gt(threads.createdAt, twentyFourHoursAgo), eq(threads.isDeleted, false)))
          .union(
            db.select({ threadId: replies.threadId }).from(replies).where(and(gt(replies.createdAt, twentyFourHoursAgo), eq(replies.isDeleted, false)))
          ).as('active_ids')
        )
      ])

      const totalPosts = (totalThreadsRes.status === 'fulfilled' ? Number(totalThreadsRes.value[0].value) : 0) + 
                         (totalRepliesRes.status === 'fulfilled' ? Number(totalRepliesRes.value[0].value) : 0)

      const postsToday = (threadsTodayRes.status === 'fulfilled' ? Number(threadsTodayRes.value[0].value) : 0) + 
                         (repliesTodayRes.status === 'fulfilled' ? Number(repliesTodayRes.value[0].value) : 0)
      
      const totalImages = (imagesRes.status === 'fulfilled' ? Number(imagesRes.value[0].value) : 0) + 
                          (replyImagesRes.status === 'fulfilled' ? Number(replyImagesRes.value[0].value) : 0)

      const activeCountRow = activeThreadsRes.status === 'fulfilled' ? (activeThreadsRes.value[0] as any) : null
      const activeCount = Number(activeCountRow?.value || 0)

      const stats = {
        totalPosts,
        postsToday,
        totalImages,
        activeThreads24h: activeCount,
      }

      return stats;
    } catch (error) {
      console.error("Error in getSystemStats:", error)
      return { totalPosts: 0, postsToday: 0, totalImages: 0, activeThreads24h: 0 };
    }
  }

}
