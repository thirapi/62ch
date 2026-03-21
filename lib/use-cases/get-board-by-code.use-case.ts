import type { BoardRepository } from "@/lib/repositories/board.repository"
import type { BoardEntity } from "@/lib/entities/board.entity"

export class GetBoardByCodeUseCase {
  constructor(private boardRepository: BoardRepository) {}

  async execute(code: string): Promise<BoardEntity | null> {
    return await this.boardRepository.findByCode(code)
  }
}
