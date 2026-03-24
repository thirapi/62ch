import type { ThreadRepository } from "@/lib/repositories/thread.repository"

export class SoftDeleteThreadUseCase {
  constructor(private threadRepository: ThreadRepository) { }

  async execute(user: any, threadId: number): Promise<any> {
    // Business rule: Check authorization
    if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
      throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
    }

    // Business rule: Validate thread exists
    const thread = await this.threadRepository.findById(threadId)
    if (!thread) {
      throw new Error("Thread not found")
    }

    if (user.role === "janitor" && !user.janitorBoards?.includes(thread.boardId)) {
      throw new Error("Unauthorized: Janitor tidak memiliki akses ke board ini");
    }

    if (thread.isDeleted) {
      return thread // Already deleted
    }

    // Business rule: Soft delete the thread
    await this.threadRepository.softDelete(threadId)

    return thread
  }
}
