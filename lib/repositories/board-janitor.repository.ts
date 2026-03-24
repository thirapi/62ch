import { db } from "@/lib/db"
import { boardJanitors } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export class BoardJanitorRepository {
  async getJanitorBoards(userId: string): Promise<number[]> {
    const results = await db
      .select({ boardId: boardJanitors.boardId })
      .from(boardJanitors)
      .where(eq(boardJanitors.userId, userId))
    
    return results.map(r => r.boardId)
  }

  async assignBoardToJanitor(userId: string, boardId: number): Promise<void> {
    await db.insert(boardJanitors).values({
      userId,
      boardId
    }).onConflictDoNothing()
  }

  async unassignBoardFromJanitor(userId: string, boardId: number): Promise<void> {
    await db
      .delete(boardJanitors)
      .where(
        and(
          eq(boardJanitors.userId, userId),
          eq(boardJanitors.boardId, boardId)
        )
      )
  }

  async getJanitorUsers(): Promise<any[]> {
    // This is useful for admin view
    return await db.query.users.findMany({
      where: (users, { eq }) => eq(users.role, "janitor"),
    })
  }

  async getJanitorAssignments(): Promise<any[]> {
    return await db.select().from(boardJanitors)
  }
}
