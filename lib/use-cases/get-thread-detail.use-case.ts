import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ReplyRepository } from "@/lib/repositories/reply.repository"
import type { ThreadUI } from "@/lib/entities/thread.entity"
import type { ReplyUI } from "@/lib/entities/reply.entity"
import { generatePosterId } from "../utils/poster-id"

export interface ThreadDetail {
  thread: ThreadUI
  replies: ReplyUI[]
}

export class GetThreadDetailUseCase {
  constructor(
    private threadRepository: ThreadRepository,
    private replyRepository: ReplyRepository,
  ) { }

  async execute(threadId: number, user?: any): Promise<ThreadDetail | null> {
    const isMod = user?.role === "admin" || user?.role === "moderator"
    const thread = await this.threadRepository.findById(threadId)

    if (!thread || (!isMod && thread.isDeleted)) {
      return null
    }

    const replies = await this.replyRepository.findByThreadId(threadId, isMod)

    // Map to UI models to filter out sensitive data (IP, deletionPassword)
    const threadUI: ThreadUI = {
      id: thread.id,
      boardId: thread.boardId,
      subject: thread.subject,
      content: thread.content,
      author: thread.author,
      createdAt: thread.createdAt,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      isArchived: thread.isArchived,
      isDeleted: thread.isDeleted,
      isNsfw: thread.isNsfw,
      isSpoiler: thread.isSpoiler,
      bumpedAt: thread.bumpedAt,
      image: thread.image,
      imageMetadata: thread.imageMetadata,
      postNumber: thread.postNumber,
      posterId: generatePosterId(thread.ipAddress, thread.id),
      capcode: thread.capcode
    }

    const repliesUI: ReplyUI[] = replies.map(r => ({
      id: r.id,
      threadId: r.threadId,
      content: r.content,
      author: r.author,
      createdAt: r.createdAt,
      isDeleted: r.isDeleted,
      isNsfw: r.isNsfw,
      isSpoiler: r.isSpoiler,
      image: r.image,
      imageMetadata: r.imageMetadata,
      postNumber: r.postNumber,
      posterId: generatePosterId(r.ipAddress, thread.id),
      capcode: r.capcode
    }))

    return {
      thread: threadUI,
      replies: repliesUI,
    }
  }
}

