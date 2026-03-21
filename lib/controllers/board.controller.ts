import type { CreateBoardUseCase } from "@/lib/use-cases/create-board.use-case"
import type { UpdateBoardUseCase } from "@/lib/use-cases/update-board.use-case"
import type { DeleteBoardUseCase } from "@/lib/use-cases/delete-board.use-case"
import type { GetBoardCategoriesUseCase } from "@/lib/use-cases/get-board-categories.use-case"
import type { GetBoardListUseCase } from "@/lib/use-cases/get-board-list.use-case"
import type { GetBoardByIdUseCase } from "@/lib/use-cases/get-board-by-id.use-case"
import type { GetBoardByCodeUseCase } from "@/lib/use-cases/get-board-by-code.use-case"

export interface CreateBoardRequest {
  code: string
  name: string
  description?: string | null
  categoryId?: number | null
}

export interface UpdateBoardRequest {
  id: number
  code?: string
  name?: string
  description?: string | null
  categoryId?: number | null
}

export class BoardController {
  constructor(
    private createBoardUseCase: CreateBoardUseCase,
    private updateBoardUseCase: UpdateBoardUseCase,
    private deleteBoardUseCase: DeleteBoardUseCase,
    private getBoardListUseCase: GetBoardListUseCase,
    private getBoardByIdUseCase: GetBoardByIdUseCase,
    private getBoardByCodeUseCase: GetBoardByCodeUseCase,
    private getBoardCategoriesUseCase: GetBoardCategoriesUseCase
  ) { }

  async getAllBoards() {
    return await this.getBoardListUseCase.execute()
  }

  async getBoardCategories() {
    return await this.getBoardCategoriesUseCase.execute()
  }

  async getBoardById(id: number) {
    const board = await this.getBoardByIdUseCase.execute(id)
    if (!board) {
      throw new Error("Board not found")
    }
    return board
  }

  async getBoardByCode(code: string) {
    return await this.getBoardByCodeUseCase.execute(code)
  }

  async createBoard(request: CreateBoardRequest) {
    if (!request.code) throw new Error("Code is required")
    if (!request.name) throw new Error("Name is required")

    return await this.createBoardUseCase.execute({
      code: request.code,
      name: request.name,
      description: request.description ?? null,
      categoryId: request.categoryId ?? null,
    })
  }

  async updateBoard(request: UpdateBoardRequest) {
    if (!request.id) throw new Error("Board ID is required")

    return await this.updateBoardUseCase.execute({
      id: request.id,
      code: request.code,
      name: request.name,
      description: request.description ?? null,
      categoryId: request.categoryId ?? null,
    })
  }

  async deleteBoard(id: number) {
    if (!id) throw new Error("Board ID is required")
    await this.deleteBoardUseCase.execute(id)
    return { success: true }
  }
}
