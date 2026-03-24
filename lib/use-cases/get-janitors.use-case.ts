import type { BoardJanitorRepository } from "@/lib/repositories/board-janitor.repository"

export class GetJanitorsUseCase {
  constructor(private boardJanitorRepository: BoardJanitorRepository) { }

  async execute(user: any) {
    // Only admin can manage janitors
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Pelaku bukan admin")
    }

    const janitors = await this.boardJanitorRepository.getJanitorUsers()
    const assignments = await this.boardJanitorRepository.getJanitorAssignments()

    return janitors.map(j => ({
      ...j,
      assignedBoardIds: assignments
        .filter(a => a.userId === j.id)
        .map(a => a.boardId)
    }))
  }
}
