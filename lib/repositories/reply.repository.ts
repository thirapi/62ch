import { db } from "@/lib/db"
import { replies } from "@/lib/db/schema"
import { asc, eq, and, sql, desc, inArray } from "drizzle-orm"
import type { ReplyEntity, CreateReplyInput } from "@/lib/entities/reply.entity"

export class ReplyRepository {
  async create(input: CreateReplyInput): Promise<ReplyEntity> {

    const rows = await db
      .insert(replies)
      .values({
        threadId: input.threadId,
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

    if (rows.length === 0) {
      throw new Error("Failed to create reply")
    }

    return this.mapToEntity(rows[0])
  }

  async bulkCreate(inputs: CreateReplyInput[]): Promise<{ id: number }[]> {
    if (inputs.length === 0) return []

    // Map input to schema format
    const values = inputs.map((input) => ({
      threadId: input.threadId,
      content: input.content,
      author: input.author ?? "Awanama",
      image: input.image ?? null,
      imageMetadata: input.imageMetadata ?? null,
      deletionPassword: input.deletionPassword ?? null,
      isNsfw: input.isNsfw ?? false,
      isSpoiler: input.isSpoiler ?? false,
      postNumber: input.postNumber,
      ipAddress: input.ipAddress ?? null,
      createdAt: input.createdAt, // Optional overwrite
      capcode: input.capcode ?? null,
    }))

    return await db.insert(replies).values(values).returning({ id: replies.id })
  }

  async findByThreadId(threadId: number, includeDeleted: boolean = false): Promise<ReplyEntity[]> {
    const condition = includeDeleted 
      ? eq(replies.threadId, threadId)
      : and(eq(replies.threadId, threadId), eq(replies.isDeleted, false))

    const rows = await db
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
      .where(condition)
      .orderBy(asc(replies.createdAt))

    return rows.map((row) => ({
      ...row,
      author: row.author ?? "Awanama",
      createdAt: row.createdAt!,
      isDeleted: row.isDeleted ?? false,
      isNsfw: row.isNsfw ?? false,
      isSpoiler: row.isSpoiler ?? false,
      postNumber: row.postNumber!,
    }))
  }

  async countByThreadId(threadId: number): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(replies)
      .where(
        and(
          eq(replies.threadId, threadId),
          eq(replies.isDeleted, false),
        )
      )

    return result[0]?.count ?? 0
  }

  async findLatestByIp(ipAddress: string): Promise<ReplyEntity | null> {
    const rows = await db
      .select()
      .from(replies)
      .where(eq(replies.ipAddress, ipAddress))
      .orderBy(desc(replies.createdAt))
      .limit(1)

    return rows.length > 0 ? this.mapToEntity(rows[0]) : null
  }

  async softDelete(id: number): Promise<void> {
    await db
      .update(replies)
      .set({ isDeleted: true })
      .where(eq(replies.id, id))
  }

  async updateNsfwStatus(id: number, isNsfw: boolean): Promise<void> {
    await db
      .update(replies)
      .set({ isNsfw })
      .where(eq(replies.id, id))
  }

  async findById(id: number): Promise<ReplyEntity | null> {
    const rows = await db
      .select()
      .from(replies)
      .where(eq(replies.id, id))
      .limit(1)

    if (rows.length === 0) {
      return null
    }

    return this.mapToEntity(rows[0])
  }

  private mapToEntity(row: typeof replies.$inferSelect): ReplyEntity {
    return {
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
      capcode: row.capcode,
    }
  }

  async findPreviewByThreadId(threadId: number, limit: number = 3): Promise<ReplyEntity[]> {
    const rows = await db
      .select()
      .from(replies)
      .where(
        and(
          eq(replies.threadId, threadId),
          eq(replies.isDeleted, false)
        )
      )
      .orderBy(desc(replies.createdAt))
      .limit(limit)

    return rows.map((row) => this.mapToEntity(row))
  }
  async findManyByIds(ids: number[]): Promise<ReplyEntity[]> {
    if (ids.length === 0) return []
    const rows = await db.query.replies.findMany({
      where: inArray(replies.id, ids),
    })
    return rows.map((row) => this.mapToEntity(row))
  }
}
