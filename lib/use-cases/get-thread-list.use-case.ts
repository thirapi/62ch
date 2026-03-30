import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ThreadUI } from "@/lib/entities/thread.entity"
import type { ReplyUI } from "@/lib/entities/reply.entity"
import { generatePosterId } from "../utils/poster-id"

export interface ThreadWithReplyCount extends ThreadUI {
  replyCount: number
  imageCount: number
  replies?: ReplyUI[]
}

export class GetThreadListUseCase {
  constructor(
    private threadRepository: ThreadRepository,
  ) { }

  async execute(
    boardId: number,
    limit: number = 50,
    offset: number = 0,
    sortBy: "bump" | "new" | "replies" | "images" = "bump"
  ): Promise<{ threads: ThreadWithReplyCount[]; totalPages: number }> {
    const [threads, totalCount] = await Promise.all([
      this.threadRepository.getThreadsWithPreviews(boardId, limit, offset, sortBy),
      this.threadRepository.countByBoardId(boardId),
    ])

    const threadsUI: ThreadWithReplyCount[] = threads.map(t => ({
      id: t.id,
      boardId: t.boardId,
      subject: t.subject,
      content: t.content,
      author: t.author,
      createdAt: t.createdAt,
      isPinned: t.isPinned,
      isLocked: t.isLocked,
      isDeleted: t.isDeleted,
      isNsfw: t.isNsfw,
      isSpoiler: t.isSpoiler,
      bumpedAt: t.bumpedAt,
      image: t.image,
      imageMetadata: t.imageMetadata,
      postNumber: t.postNumber,
      posterId: generatePosterId(t.ipAddress, t.id),
      capcode: t.capcode,
      replyCount: t.replyCount,
      imageCount: t.imageCount,
      replies: t.replies.map(r => ({
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
        posterId: generatePosterId(r.ipAddress, t.id),
        capcode: r.capcode
      }))
    }))

    return {
      threads: threadsUI,
      totalPages: Math.ceil(totalCount / limit),
    }
  }
}

