import type { BoardJanitorRepository } from "@/lib/repositories/board-janitor.repository"

export class AssignBoardToJanitorUseCase {
  constructor(private boardJanitorRepository: BoardJanitorRepository) { }

  async execute(user: any, janitorUserId: string, boardId: number) {
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Pelaku bukan admin")
    }

    await this.boardJanitorRepository.assignBoardToJanitor(janitorUserId, boardId)
  }
}
