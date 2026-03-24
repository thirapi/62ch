import type { ReplyRepository } from "@/lib/repositories/reply.repository"
import type { ThreadRepository } from "@/lib/repositories/thread.repository"

export class SoftDeleteReplyUseCase {
  constructor(private replyRepository: ReplyRepository, private threadRepository: ThreadRepository) { }

  async execute(user: any, replyId: number): Promise<any> {
    // Business rule: Check authorization
    if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
      throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
    }

    const reply = await this.replyRepository.findById(replyId)
    if (!reply) {
      throw new Error("Reply not found")
    }

    if (user.role === "janitor") {
      const thread = await this.threadRepository.findById(reply.threadId);
      if (!thread || !user.janitorBoards?.includes(thread.boardId)) {
        throw new Error("Unauthorized: Janitor tidak memiliki akses ke board ini");
      }
    }

    // Business rule: Soft delete the reply
    await this.replyRepository.softDelete(replyId)
    return reply
  }
}
