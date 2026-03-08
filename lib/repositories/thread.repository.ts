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

    // 3. Fetch latest 3 replies for each thread
    // Ideally use window functions, but for simplicity and safety with current setup, 
    // we'll use Promise.all which is fine for small limits (e.g. 50 threads).
    const repliesMap = new Map<number, any[]>()

    // We can optimization this further by fetching all candidates in one query if needed, 
    // but a few parallel queries is better than 1000 serial/parallel N+1 on the whole DB.
    // For 50 threads, 50 queries is okay-ish to start, but let's try to improve.
    // Actually, let's keep it simple: Promise.all of findPreviewByThreadId is okay for < 50 items.
    // But since we are here for efficiency, let's use a window function query if possible.
    // Constructing the complex mapped entity from raw sql is tedious. 
    // Let's stick to Promise.all for now as it reuse existing repository logic which is typesafe.
    // But wait, I can inject ReplyRepository? No, repositories shouldn't depend on each other cyclically.
    // I should move this logic to UseCase OR duplicate the simple query here.

    // Let's just return the threads and let the UseCase handle the replies fetching EFFICIENTLY
    // by using the new 'count' map at least.

    // Actually, I'll implement the full fetch here to encapsulate the optimization.
    // I will rely on a helper to fetch previews or just execute the queries.

    const previews = await Promise.all(
      threadIds.map(async (id) => {
        const rows = await db.query.replies.findMany({
          where: and(
            eq(replies.threadId, id),
            eq(replies.isDeleted, false)
          ),
          orderBy: [desc(replies.createdAt)],
          limit: 3
        });
        return { id, rows }
      })
    )

    previews.forEach(p => {
      // Need to map rows to entities - I'll duplicate the mapToEntity logic or move it to a shared helper?
      // Since this is inside ThreadRepository, I can't easily access ReplyRepository.mapToEntity.
      // I will just return raw rows or simplified objects.
      // Actually, the UseCase expects ReplyUI.
      // Let's manually map for now.
      const mapped = p.rows.map(row => ({
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
        ipAddress: row.ipAddress
      }))
      repliesMap.set(p.id, mapped.reverse()) // Reverse to show chronological order in preview
    })

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
    }
  }
}
