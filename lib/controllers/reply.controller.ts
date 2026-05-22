import type { ReplyToThreadUseCase } from "@/lib/use-cases/reply-to-thread.use-case"

export interface CreateReplyRequest {
  threadId: number
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

export class ReplyController {
  constructor(private replyToThreadUseCase: ReplyToThreadUseCase) { }

  async createReply(request: CreateReplyRequest) {
    // Input validation only
    if (!request.threadId) {
      throw new Error("Thread ID is required")
    }

    if (!request.content) {
      throw new Error("Content is required")
    }

    // Call use case
    const { id, postNumber } = await this.replyToThreadUseCase.execute({
      threadId: request.threadId,
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

    return { replyId: id, postNumber }
  }
}
