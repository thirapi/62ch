import type { BoardRepository } from "@/lib/repositories/board.repository"
import type { CreateBoardCommand, BoardEntity } from "@/lib/entities/board.entity"

export class CreateBoardUseCase {
  constructor(private boardRepository: BoardRepository) { }

  async execute(user: any, input: CreateBoardCommand): Promise<BoardEntity> {
    // Business Rule: Check authorization
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Hanya admin yang dapat membuat board baru")
    }

    // Business Rule: Code MUST be provided and valid (slug-like)
    if (!input.code || input.code.trim().length === 0) {
      throw new Error("Board code is required")
    }

    if (!/^[a-z0-9]+$/.test(input.code)) {
      throw new Error("Board code must only contain lowercase letters and numbers")
    }

    if (input.code.length > 10) {
      throw new Error("Board code is too long (max 10 characters)")
    }

    // Business Rule: Check for uniqueness
    const existing = await this.boardRepository.findByCode(input.code)
    if (existing) {
      throw new Error(`Board with code /${input.code}/ already exists`)
    }

    // Business Rule: Name is required
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("Board name is required")
    }

    if (input.name.length > 100) {
      throw new Error("Board name is too long (max 100 characters)")
    }

    return await this.boardRepository.create({
      code: input.code.toLowerCase(),
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
    })
  }
}
