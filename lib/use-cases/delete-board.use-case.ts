import type { BoardRepository } from "@/lib/repositories/board.repository"

export class DeleteBoardUseCase {
  constructor(private boardRepository: BoardRepository) { }

  async execute(user: any, id: number): Promise<void> {
    // Business Rule: Check authorization
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Hanya admin yang dapat menghapus board")
    }

    const board = await this.boardRepository.findById(id)
    if (!board) {
      throw new Error("Board not found")
    }

    // Business Rule: Can't delete board if it's currently being used for something critical?
    // For now, simple delete. Cascade at DB level handles threads/replies.
    await this.boardRepository.delete(id)
  }
}
