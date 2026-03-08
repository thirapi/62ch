import type { ThreadRepository } from "@/lib/repositories/thread.repository"

export class UnlockThreadUseCase {
  constructor(private threadRepository: ThreadRepository) {}

  async execute(user: any, threadId: number): Promise<void> {
    // Business rule: Check authorization
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      throw new Error("Unauthorized: Pelaku bukan admin atau moderator")
    }

    // Business rule: Validate thread exists
    const thread = await this.threadRepository.findById(threadId)
    if (!thread) {
      throw new Error("Thread not found")
    }

    // Business rule: Unlock the thread
    await this.threadRepository.updateLockStatus(threadId, false)
  }
}
