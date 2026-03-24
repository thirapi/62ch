import { db } from "@/lib/db"
import { reports } from "@/lib/db/schema"
import { desc, eq, or, sql, inArray } from "drizzle-orm"
import type { ReportEntity, CreateReportInput } from "@/lib/entities/report.entity"

export class ReportRepository {
  async create(input: CreateReportInput): Promise<ReportEntity> {
    const rows = await db
      .insert(reports)
      .values({
        contentType: input.contentType,
        contentId: input.contentId,
        reason: input.reason,
      })
      .returning()

    if (rows.length === 0) {
      throw new Error("Failed to create report")
    }

    return this.mapToEntity(rows[0])
  }

  async findAll(): Promise<ReportEntity[]> {
    const rows = await db
      .select()
      .from(reports)
      .orderBy(desc(reports.reportedAt))

    return rows.map((row) => this.mapToEntity(row))
  }

  async findPending(): Promise<ReportEntity[]> {
    const rows = await db
      .select()
      .from(reports)
      .where(eq(reports.status, "pending"))
      .orderBy(desc(reports.reportedAt))

    return rows.map((row) => this.mapToEntity(row))
  }

  async findPendingPaged(limit: number, offset: number, boardId?: number | number[]): Promise<ReportEntity[]> {
    const whereClause = this.getBoardFilterSql(boardId, sql`status = 'pending'`)

    const rows = await db
      .select()
      .from(reports)
      .where(whereClause)
      .orderBy(desc(reports.reportedAt))
      .limit(limit)
      .offset(offset)

    return rows.map((row) => this.mapToEntity(row))
  }

  async countPending(boardId?: number | number[]): Promise<number> {
    const whereClause = this.getBoardFilterSql(boardId, sql`status = 'pending'`)

    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(whereClause)
    return Number(row?.count || 0)
  }

  async findResolved(): Promise<ReportEntity[]> {
    const rows = await db
      .select()
      .from(reports)
      .where(or(eq(reports.status, "resolved"), eq(reports.status, "dismissed")))
      .orderBy(desc(reports.reportedAt))

    return rows.map((row) => this.mapToEntity(row))
  }

  async findResolvedPaged(limit: number, offset: number, boardId?: number | number[]): Promise<ReportEntity[]> {
    const whereClause = this.getBoardFilterSql(boardId, sql`status != 'pending'`)

    const rows = await db
      .select()
      .from(reports)
      .where(whereClause)
      .orderBy(desc(reports.resolvedAt))
      .limit(limit)
      .offset(offset)

    return rows.map((row) => this.mapToEntity(row))
  }

  async countResolved(boardId?: number | number[]): Promise<number> {
    const whereClause = this.getBoardFilterSql(boardId, sql`status != 'pending'`)

    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(reports)
      .where(whereClause)

    return result[0]?.count ?? 0
  }

  async updateStatus(
    id: number,
    status: "resolved" | "dismissed",
    resolvedBy: string,
    boardId?: number | number[],
  ): Promise<void> {
    const baseCondition = eq(reports.id, id);
    const whereClause = this.getBoardFilterSql(boardId, baseCondition);

    await db
      .update(reports)
      .set({
        status,
        resolvedAt: new Date(),
        resolvedBy,
      })
      .where(whereClause)
  }

  async updateStatusBulk(
    ids: number[],
    status: "resolved" | "dismissed",
    resolvedBy: string,
    boardId?: number | number[],
  ): Promise<void> {
    if (ids.length === 0) return
    const baseCondition = inArray(reports.id, ids);
    const whereClause = this.getBoardFilterSql(boardId, baseCondition);

    await db
      .update(reports)
      .set({
        status,
        resolvedAt: new Date(),
        resolvedBy,
      })
      .where(whereClause)
  }

  private mapToEntity(row: typeof reports.$inferSelect): ReportEntity {
    return {
      id: row.id,
      contentType: row.contentType,
      contentId: row.contentId,
      reason: row.reason,
      reportedAt: row.reportedAt!,
      status: row.status ?? "pending",
      resolvedAt: row.resolvedAt ?? undefined,
      resolvedBy: row.resolvedBy ?? undefined,
    }
  }

  private getBoardFilterSql(boardId: number | number[] | undefined, baseCondition: ReturnType<typeof sql>) {
    if (boardId === undefined) {
      if (typeof baseCondition === "object" && baseCondition !== null && "queryChunks" in baseCondition) {
        if ((baseCondition as any).queryChunks[0] === "status != 'pending'") {
           return or(eq(reports.status, "resolved"), eq(reports.status, "dismissed"));
        }
      }
      return baseCondition; // Used for count queries or basic status
    }

    if (Array.isArray(boardId)) {
      if (boardId.length === 0) {
        return sql`1 = 0`; // No boards to filter = return empty results
      }
      
      const bdCondition = sql`threads.board_id IN (${sql.join(boardId.map(id => sql`${id}`), sql`, `)})`;
      return sql`${baseCondition} AND (
        (content_type = 'thread' AND EXISTS (SELECT 1 FROM threads WHERE threads.id = reports.content_id AND ${bdCondition}))
        OR
        (content_type = 'reply' AND EXISTS (SELECT 1 FROM replies JOIN threads ON replies.thread_id = threads.id WHERE replies.id = reports.content_id AND ${bdCondition}))
      )`;
    }

    // Single boardId logic
    return sql`${baseCondition} AND (
      (content_type = 'thread' AND EXISTS (SELECT 1 FROM threads WHERE threads.id = reports.content_id AND threads.board_id = ${boardId}))
      OR
      (content_type = 'reply' AND EXISTS (SELECT 1 FROM replies JOIN threads ON replies.thread_id = threads.id WHERE replies.id = reports.content_id AND threads.board_id = ${boardId}))
    )`;
  }
}
