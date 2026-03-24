import type { GetJanitorsUseCase } from "@/lib/use-cases/get-janitors.use-case"
import type { CreateJanitorUseCase } from "@/lib/use-cases/create-janitor.use-case"
import type { AssignBoardToJanitorUseCase } from "@/lib/use-cases/assign-board-to-janitor.use-case"
import type { UnassignBoardFromJanitorUseCase } from "@/lib/use-cases/unassign-board-from-janitor.use-case"
import type { DeleteJanitorUseCase } from "@/lib/use-cases/delete-janitor.use-case"

export class JanitorController {
  constructor(
    private getJanitorsUseCase: GetJanitorsUseCase,
    private createJanitorUseCase: CreateJanitorUseCase,
    private assignBoardToJanitorUseCase: AssignBoardToJanitorUseCase,
    private unassignBoardFromJanitorUseCase: UnassignBoardFromJanitorUseCase,
    private deleteJanitorUseCase: DeleteJanitorUseCase
  ) { }

  async getJanitors(user: any) {
    return await this.getJanitorsUseCase.execute(user)
  }

  async createJanitor(user: any, data: { email: string; password?: string }) {
    if (!data.email) throw new Error("Email is required")
    return await this.createJanitorUseCase.execute(user, data)
  }

  async assignBoard(user: any, janitorUserId: string, boardId: number) {
    if (!janitorUserId || !boardId) throw new Error("User ID and Board ID are required")
    return await this.assignBoardToJanitorUseCase.execute(user, janitorUserId, boardId)
  }

  async unassignBoard(user: any, janitorUserId: string, boardId: number) {
    if (!janitorUserId || !boardId) throw new Error("User ID and Board ID are required")
    return await this.unassignBoardFromJanitorUseCase.execute(user, janitorUserId, boardId)
  }

  async deleteJanitor(user: any, janitorUserId: string) {
    if (!janitorUserId) throw new Error("User ID is required")
    return await this.deleteJanitorUseCase.execute(user, janitorUserId)
  }
}
