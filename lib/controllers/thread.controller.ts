import type { CreateThreadUseCase } from "@/lib/use-cases/create-thread.use-case"
import type { GetThreadListUseCase } from "@/lib/use-cases/get-thread-list.use-case"
import type { GetThreadDetailUseCase } from "@/lib/use-cases/get-thread-detail.use-case"

export interface CreateThreadRequest {
  boardId: number
  subject?: string
  content: string
  author?: string
  imageFile?: File | null
  deletionPassword?: string
  isNsfw?: boolean
  isSpoiler?: boolean
  ipAddress?: string
  capcode?: string | null
}

export class ThreadController {
  constructor(
    private createThreadUseCase: CreateThreadUseCase,
    private getThreadListUseCase: GetThreadListUseCase,
    private getThreadDetailUseCase: GetThreadDetailUseCase,
  ) { }

  async createThread(request: CreateThreadRequest) {
    // Input validation only
    if (!request.boardId) {
      throw new Error("Board ID is required")
    }

    if (!request.content) {
      throw new Error("Content is required")
    }

    // Call use case
    const threadId = await this.createThreadUseCase.execute({
      boardId: request.boardId,
      subject: request.subject,
      content: request.content,
      author: request.author,
      imageFile: request.imageFile,
      deletionPassword: request.deletionPassword,
      isNsfw: request.isNsfw,
      isSpoiler: request.isSpoiler,
      ipAddress: request.ipAddress,
      capcode: request.capcode
    })

    return { threadId }
  }

  async getThreadList(boardId: number, limit: number = 50, offset: number = 0) {
    // Input validation only
    if (!boardId) {
      throw new Error("Board ID is required")
    }

    // Call use case
    return await this.getThreadListUseCase.execute(boardId, limit, offset)
  }

  async getThreadDetail(threadId: number) {
    // Input validation only
    if (!threadId) {
      throw new Error("Thread ID is required")
    }

    // Call use case
    const result = await this.getThreadDetailUseCase.execute(threadId)

    if (!result) {
      throw new Error("Thread not found")
    }

    return result
  }
}
