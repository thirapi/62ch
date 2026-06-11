import type { BoardRepository } from "@/lib/repositories/board.repository"
import type { UpdateBoardCommand, BoardEntity } from "@/lib/entities/board.entity"

export class UpdateBoardUseCase {
  constructor(private boardRepository: BoardRepository) { }

  async execute(user: any, input: UpdateBoardCommand): Promise<BoardEntity> {
    // Business Rule: Check authorization
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      throw new Error("Unauthorized: Pelaku bukan admin atau moderator")
    }

    const board = await this.boardRepository.findById(input.id)
    if (!board) {
      throw new Error("Board not found")
    }

    // Business Rule: Moderator restrictions
    if (user.role === "moderator") {
      if (input.code && input.code !== board.code) {
        throw new Error("Unauthorized: Moderator tidak diizinkan mengubah slug/kode board")
      }
      if (input.categoryId !== undefined && input.categoryId !== board.categoryId) {
        throw new Error("Unauthorized: Moderator tidak diizinkan mengubah kategori board")
      }
    }

    // Business Rule: Validate new code uniqueness if changed
    if (input.code && input.code !== board.code) {
      if (!/^[a-z0-9]+$/.test(input.code)) {
        throw new Error("Board code must only contain lowercase letters and numbers")
      }

      const existing = await this.boardRepository.findByCode(input.code)
      if (existing) {
        throw new Error(`Board with code /${input.code}/ already exists`)
      }
    }

    // Business Rule: Validate name if changed
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw new Error("Board name is required")
      }

      if (input.name.length > 100) {
        throw new Error("Board name is too long (max 100 characters)")
      }
    }

    return await this.boardRepository.update(input.id, {
      code: input.code?.toLowerCase(),
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
    })
  }
}
