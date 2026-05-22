import type { CreateThreadUseCase } from "@/lib/use-cases/create-thread.use-case"
import type { GetThreadListUseCase } from "@/lib/use-cases/get-thread-list.use-case"
import type { GetThreadDetailUseCase } from "@/lib/use-cases/get-thread-detail.use-case"
import type { DeletePostWithPasswordUseCase } from "@/lib/use-cases/delete-post-with-password.use-case"
import type { SearchThreadsUseCase } from "@/lib/use-cases/search-threads.use-case"

export interface CreateThreadRequest {
  boardId: number
  subject?: string
  content: string
  author?: string
  imageFile?: File | null
  imageUrl?: string
  imageMetadata?: string
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
    private deletePostWithPasswordUseCase: DeletePostWithPasswordUseCase,
    private searchThreadsUseCase: SearchThreadsUseCase,
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
    const { id, postNumber } = await this.createThreadUseCase.execute({
      boardId: request.boardId,
      subject: request.subject,
      content: request.content,
      author: request.author,
      imageFile: request.imageFile,
      imageUrl: request.imageUrl,
      imageMetadata: request.imageMetadata,
      deletionPassword: request.deletionPassword,
      isNsfw: request.isNsfw,
      isSpoiler: request.isSpoiler,
      ipAddress: request.ipAddress,
      capcode: request.capcode
    })

    return { threadId: id, postNumber }
  }

  async getThreadList(
    boardId: number,
    limit?: number,
    offset?: number,
    sortBy?: "bump" | "new" | "replies" | "images"
  ) {
    // Input validation only
    if (!boardId) {
      throw new Error("Board ID is required")
    }

    // Call use case
    return await this.getThreadListUseCase.execute(boardId, limit, offset, sortBy)
  }

  async getThreadDetail(threadId: number) {
    // Input validation only
    if (!threadId) {
      throw new Error("Thread ID is required")
    }

    // Call use case
    return await this.getThreadDetailUseCase.execute(threadId)
  }

  async deletePostWithPassword(postId: number, postType: "thread" | "reply", password?: string) {
    if (!postId || !postType) throw new Error("Post ID and Post Type is required")
    return await this.deletePostWithPasswordUseCase.execute(postId, postType, password)
  }

  async searchThreads(boardId: number, query: string) {
    if (!boardId) throw new Error("Board ID is required")
    if (!query) return []
    return await this.searchThreadsUseCase.execute(boardId, query)
  }
}
