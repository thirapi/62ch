import { db } from "@/lib/db"
import { threads, replies } from "@/lib/db/schema"
import { asc, eq, desc, and, sql, inArray } from "drizzle-orm"
import type { ThreadEntity, CreateThreadInput } from "@/lib/entities/thread.entity"

export class ThreadRepository {
  async create(input: CreateThreadInput): Promise<ThreadEntity> {
    const [row] = await db
      .insert(threads)
      .values({
        boardId: input.boardId,
        subject: input.subject ?? null,
        content: input.content,
        author: input.author ?? "Awanama",
        image: input.image ?? null,
        imageMetadata: input.imageMetadata ?? null,
        deletionPassword: input.deletionPassword ?? null,
        isNsfw: input.isNsfw ?? false,
        isSpoiler: input.isSpoiler ?? false,
        postNumber: input.postNumber,
        ipAddress: input.ipAddress ?? null,
        capcode: input.capcode ?? null,
      })
      .returning()

    if (!row) throw new Error("Failed to create thread")

    return this.mapToEntity(row)
  }

  async bulkCreate(inputs: CreateThreadInput[]): Promise<{ id: number }[]> {
    if (inputs.length === 0) return []

    // Map input to schema format
    const values = inputs.map((input) => ({
      boardId: input.boardId,
      subject: input.subject ?? null,
      content: input.content,
      author: input.author ?? "Awanama",
      image: input.image ?? null,
      imageMetadata: input.imageMetadata ?? null,
      deletionPassword: input.deletionPassword ?? null,
      isNsfw: input.isNsfw ?? false,
      isSpoiler: input.isSpoiler ?? false,
      postNumber: input.postNumber,
      ipAddress: input.ipAddress ?? null,
      createdAt: input.createdAt, // Optional overwrite if provided in entity input, else defaultNow
      bumpedAt: input.bumpedAt, // Optional overwrite
      capcode: input.capcode ?? null,
    }))

    return await db.insert(threads).values(values).returning({ id: threads.id })
  }

  async findById(id: number): Promise<ThreadEntity | null> {
    const row = await db.query.threads.findFirst({
      where: eq(threads.id, id),
    })

    return row ? this.mapToEntity(row) : null
  }

  async findByIdWithPassword(id: number): Promise<ThreadEntity | null> {
    const row = await db.query.threads.findFirst({
      where: eq(threads.id, id),
    })

    return row ? this.mapToEntity(row) : null
  }

  async findByBoardId(boardId: number): Promise<ThreadEntity[]> {
    const rows = await db
      .select({
        id: threads.id,
        boardId: threads.boardId,
        subject: threads.subject,
        content: threads.content,
        author: threads.author,
        image: threads.image,
        imageMetadata: threads.imageMetadata,
        isPinned: threads.isPinned,
        isLocked: threads.isLocked,
        isDeleted: threads.isDeleted,
        isNsfw: threads.isNsfw,
        isSpoiler: threads.isSpoiler,
        createdAt: threads.createdAt,
        bumpedAt: threads.bumpedAt,
        postNumber: threads.postNumber,
        ipAddress: threads.ipAddress,
        capcode: threads.capcode,
      })
      .from(threads)
      .where(and(eq(threads.boardId, boardId), eq(threads.isDeleted, false)))
      .orderBy(desc(threads.isPinned), desc(threads.bumpedAt))

    return rows.map((row) => ({
      ...row,
      author: row.author ?? "Awanama",
      createdAt: row.createdAt!,
      bumpedAt: row.bumpedAt!,
      postNumber: row.postNumber!,
      isPinned: row.isPinned ?? false,
      isLocked: row.isLocked ?? false,
      isDeleted: row.isDeleted ?? false,
      isNsfw: row.isNsfw ?? false,
      isSpoiler: row.isSpoiler ?? false,
    }))
  }

  async findLatest(limit: number): Promise<ThreadEntity[]> {
    const rows = await db
      .select({
        id: threads.id,
        boardId: threads.boardId,
        subject: threads.subject,
        content: threads.content,
        author: threads.author,
        image: threads.image,
        imageMetadata: threads.imageMetadata,
        isPinned: threads.isPinned,
        isLocked: threads.isLocked,
        isDeleted: threads.isDeleted,
        isNsfw: threads.isNsfw,
        isSpoiler: threads.isSpoiler,
        createdAt: threads.createdAt,
        bumpedAt: threads.bumpedAt,
        postNumber: threads.postNumber,
        ipAddress: threads.ipAddress,
        capcode: threads.capcode,
      })
      .from(threads)
      .where(eq(threads.isDeleted, false))
      .orderBy(desc(threads.createdAt))
      .limit(limit)

    return rows.map((row) => ({
      ...row,
      author: row.author ?? "Awanama",
      createdAt: row.createdAt!,
      bumpedAt: row.bumpedAt!,
      postNumber: row.postNumber!,
      isPinned: row.isPinned ?? false,
      isLocked: row.isLocked ?? false,
      isDeleted: row.isDeleted ?? false,
      isNsfw: row.isNsfw ?? false,
      isSpoiler: row.isSpoiler ?? false,
    }))
  }

  async findLatestByIp(ipAddress: string): Promise<ThreadEntity | null> {
    const row = await db.query.threads.findFirst({
      where: eq(threads.ipAddress, ipAddress),
      orderBy: [desc(threads.createdAt)],
    })

    return row ? this.mapToEntity(row) : null
  }

  async softDelete(id: number): Promise<void> {
    await db
      .update(threads)
      .set({ isDeleted: true })
      .where(eq(threads.id, id))
  }

  async updateBumpTime(id: number): Promise<void> {
    await db
      .update(threads)
      .set({ bumpedAt: new Date() })
      .where(eq(threads.id, id))
  }

  async updateLockStatus(id: number, isLocked: boolean): Promise<void> {
    await db
      .update(threads)
      .set({ isLocked })
      .where(eq(threads.id, id))
  }

  async updatePinStatus(id: number, isPinned: boolean): Promise<void> {
    await db
      .update(threads)
      .set({ isPinned })
      .where(eq(threads.id, id))
  }

  async updateNsfwStatus(id: number, isNsfw: boolean): Promise<void> {
    await db
      .update(threads)
      .set({ isNsfw })
      .where(eq(threads.id, id))
  }

  async getThreadsWithPreviews(
    boardId: number,
    limit: number = 50,
    offset: number = 0,
    sortBy: "bump" | "new" | "replies" | "images" = "bump"
  ): Promise<
    (ThreadEntity & { replyCount: number; imageCount: number; replies: any[] })[]
  > {
    // 1. Fetch threads with specific columns only (exclude deletionPassword)
    const orderBy = [];
    orderBy.push(desc(threads.isPinned));
    if (sortBy === "new") {
      orderBy.push(desc(threads.createdAt));
    } else {
      orderBy.push(desc(threads.bumpedAt));
    }

    const threadsRows = await db
      .select({
        id: threads.id,
        boardId: threads.boardId,
        subject: threads.subject,
        content: threads.content,
        author: threads.author,
        image: threads.image,
        imageMetadata: threads.imageMetadata,
        isPinned: threads.isPinned,
        isLocked: threads.isLocked,
        isDeleted: threads.isDeleted,
        isNsfw: threads.isNsfw,
        isSpoiler: threads.isSpoiler,
        createdAt: threads.createdAt,
        bumpedAt: threads.bumpedAt,
        postNumber: threads.postNumber,
        ipAddress: threads.ipAddress,
        capcode: threads.capcode,
      })
      .from(threads)
      .where(and(eq(threads.boardId, boardId), eq(threads.isDeleted, false)))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset)

    if (threadsRows.length === 0) {
      return []
    }

    const threadIds = threadsRows.map((t) => t.id)

    // 2. Fetch reply counts in one query
    const counts = await db
      .select({
        threadId: replies.threadId,
        replyCount: sql<number>`cast(count(*) as int)`,
        imageCount: sql<number>`cast(count(${replies.image}) as int)`,
      })
      .from(replies)
      .where(and(inArray(replies.threadId, threadIds), eq(replies.isDeleted, false)))
      .groupBy(replies.threadId)

    const countMap = new Map(counts.map((c) => [c.threadId, c]))

    // 3. Optimized: Fetch latest 3 replies for ALL threads in one query using window function
    // This solves the N+1 problem (was 50+ queries, now just 1)
    const latestReplies = await db
      .select({
        id: replies.id,
        threadId: replies.threadId,
        content: replies.content,
        author: replies.author,
        image: replies.image,
        imageMetadata: replies.imageMetadata,
        isDeleted: replies.isDeleted,
        isNsfw: replies.isNsfw,
        isSpoiler: replies.isSpoiler,
        createdAt: replies.createdAt,
        postNumber: replies.postNumber,
        ipAddress: replies.ipAddress,
        capcode: replies.capcode,
      })
      .from(replies)
      .innerJoin(
        sql`(
          SELECT id, ROW_NUMBER() OVER (PARTITION BY thread_id ORDER BY created_at DESC) as rn
          FROM ${replies}
          WHERE thread_id IN (${sql.join(threadIds, sql`, `)}) AND is_deleted = false
        ) as ranked_replies`,
        eq(replies.id, sql`ranked_replies.id`)
      )
      .where(sql`ranked_replies.rn <= 3`)
      .orderBy(asc(replies.createdAt))

    // Group replies by threadId
    const repliesMap = new Map<number, any[]>()
    latestReplies.forEach((row) => {
      if (!repliesMap.has(row.threadId)) {
        repliesMap.set(row.threadId, [])
      }
      repliesMap.get(row.threadId)!.push({
        ...row,
        author: row.author ?? "Awanama",
        createdAt: row.createdAt!,
        isDeleted: row.isDeleted ?? false,
      })
    })

    // 4. Map final entities
    return threadsRows.map((row) => {
      const c = countMap.get(row.id)
      const threadReplies = repliesMap.get(row.id) || []
      
      return {
        id: row.id,
        boardId: row.boardId,
        subject: row.subject,
        content: row.content,
        author: row.author ?? "Awanama",
        createdAt: row.createdAt!,
        isPinned: row.isPinned ?? false,
        isLocked: row.isLocked ?? false,
        isDeleted: row.isDeleted ?? false,
        isNsfw: row.isNsfw ?? false,
        isSpoiler: row.isSpoiler ?? false,
        bumpedAt: row.bumpedAt!,
        image: row.image,
        imageMetadata: row.imageMetadata,
        postNumber: row.postNumber!,
        ipAddress: row.ipAddress,
        capcode: row.capcode,
        replyCount: c?.replyCount || 0,
        imageCount: (c?.imageCount || 0) + (row.image ? 1 : 0),
        replies: threadReplies,
      }
    })
  }

  async countByBoardId(boardId: number): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(threads)
      .where(
        and(
          eq(threads.boardId, boardId),
          eq(threads.isDeleted, false),
        ),
      )

    return result[0]?.count ?? 0
  }

  async findManyByIds(ids: number[]): Promise<ThreadEntity[]> {
    if (ids.length === 0) return []
    const rows = await db.query.threads.findMany({
      where: inArray(threads.id, ids),
    })
    return rows.map((row) => this.mapToEntity(row))
  }

  private mapToEntity(row: typeof threads.$inferSelect): ThreadEntity {
    return {
      id: row.id,
      boardId: row.boardId,
      subject: row.subject,
      content: row.content,
      author: row.author ?? "Awanama",
      createdAt: row.createdAt!,
      isPinned: row.isPinned ?? false,
      isLocked: row.isLocked ?? false,
      isDeleted: row.isDeleted ?? false,
      isNsfw: row.isNsfw ?? false,
      isSpoiler: row.isSpoiler ?? false,
      bumpedAt: row.bumpedAt!,
      image: row.image ?? undefined,
      imageMetadata: row.imageMetadata,
      deletionPassword: row.deletionPassword,
      postNumber: row.postNumber!,
      ipAddress: row.ipAddress,
      capcode: row.capcode,
    }
  }
}
