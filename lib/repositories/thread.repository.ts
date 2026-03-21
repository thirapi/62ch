import { db } from "@/lib/db"
import { threads, replies } from "@/lib/db/schema"
import { eq, desc, and, sql, inArray } from "drizzle-orm"
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

  async findByBoardId(boardId: number): Promise<ThreadEntity[]> {
    const rows = await db.query.threads.findMany({
      where: and(
        eq(threads.boardId, boardId),
        eq(threads.isDeleted, false),
      ),
      orderBy: [
        desc(threads.isPinned),
        desc(threads.bumpedAt),
      ],
    })

    return rows.map((row) => this.mapToEntity(row))
  }

  async findLatest(limit: number): Promise<ThreadEntity[]> {
    const rows = await db.query.threads.findMany({
      where: eq(threads.isDeleted, false),
      orderBy: [desc(threads.createdAt)],
      limit,
    })

    return rows.map((row) => this.mapToEntity(row))
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
  ): Promise<
    (ThreadEntity & { replyCount: number; replies: any[] })[]
  > {
    // 1. Fetch threads
    const threadsRows = await db.query.threads.findMany({
      where: and(
        eq(threads.boardId, boardId),
        eq(threads.isDeleted, false),
      ),
      orderBy: [
        desc(threads.isPinned),
        desc(threads.bumpedAt),
      ],
      limit,
      offset,
    })

    if (threadsRows.length === 0) {
      return []
    }

    const threadIds = threadsRows.map((t) => t.id)
    const threadEntities = threadsRows.map((row) => this.mapToEntity(row))

    // 2. Fetch reply counts in one query
    const counts = await db
      .select({
        threadId: replies.threadId,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(replies)
      .where(
        and(
          inArray(replies.threadId, threadIds),
          eq(replies.isDeleted, false),
        ),
      )
      .groupBy(replies.threadId)

    const countMap = new Map(counts.map((c) => [c.threadId, c.count]))

    // 3. Fetch latest 3 replies for ALL threads in one query using a window function
    // This optimization reduces the number of queries from N+2 to 3.
    const repliesMap = new Map<number, any[]>()
    const sq = db
      .select({
        id: replies.id,
        threadId: replies.threadId,
        content: replies.content,
        author: replies.author,
        createdAt: replies.createdAt,
        isDeleted: replies.isDeleted,
        isNsfw: replies.isNsfw,
        isSpoiler: replies.isSpoiler,
        image: replies.image,
        imageMetadata: replies.imageMetadata,
        deletionPassword: replies.deletionPassword,
        postNumber: replies.postNumber,
        ipAddress: replies.ipAddress,
        capcode: replies.capcode,
        rn: sql<number>`row_number() over (partition by ${replies.threadId} order by ${replies.createdAt} desc)`.as("rn"),
      })
      .from(replies)
      .where(
        and(
          inArray(replies.threadId, threadIds),
          eq(replies.isDeleted, false)
        )
      )
      .as("sq")

    const allLatestReplies = await db
      .select()
      .from(sq)
      .where(sql`${sq.rn} <= 3`)

    // Group the results back into the map
    allLatestReplies.forEach((row) => {
      if (!repliesMap.has(row.threadId)) {
        repliesMap.set(row.threadId, [])
      }
      
      const mapped = {
        id: row.id,
        threadId: row.threadId,
        content: row.content,
        author: row.author ?? "Awanama",
        createdAt: row.createdAt!,
        isDeleted: row.isDeleted ?? false,
        isNsfw: row.isNsfw ?? false,
        isSpoiler: row.isSpoiler ?? false,
        image: row.image,
        imageMetadata: row.imageMetadata,
        deletionPassword: row.deletionPassword,
        postNumber: row.postNumber!,
        ipAddress: row.ipAddress,
        capcode: row.capcode
      }
      
      repliesMap.get(row.threadId)!.push(mapped)
    })

    // Sort replies chronologically for each thread preview
    for (const [threadId, threadReplies] of repliesMap.entries()) {
      repliesMap.set(threadId, threadReplies.reverse())
    }

    return threadEntities.map((thread) => ({
      ...thread,
      replyCount: countMap.get(thread.id) || 0,
      replies: repliesMap.get(thread.id) || [],
    }))
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
