import type { ReplyRepository } from "@/lib/repositories/reply.repository"

export class SoftDeleteReplyUseCase {
  constructor(private replyRepository: ReplyRepository) { }

  async execute(user: any, replyId: number): Promise<any> {
    // Business rule: Check authorization
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      throw new Error("Unauthorized: Pelaku bukan admin atau moderator")
    }

    const reply = await this.replyRepository.findById(replyId)
    if (!reply) {
      throw new Error("Reply not found")
    }

    // Business rule: Soft delete the reply
    await this.replyRepository.softDelete(replyId)
    return reply
  }
}
