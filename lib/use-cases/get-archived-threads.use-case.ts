import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ArchivedThreadSummary } from "@/lib/entities/thread.entity"

export class GetArchivedThreadsUseCase {
  constructor(private threadRepository: ThreadRepository) {}

  async execute(boardId: number, limit = 300): Promise<ArchivedThreadSummary[]> {
    // Business rule: archive listing is capped to keep the page light
    const validLimit = Math.max(1, Math.min(limit, 500))
    return await this.threadRepository.findArchivedByBoardId(boardId, validLimit)
  }
}
