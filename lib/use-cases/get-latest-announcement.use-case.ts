import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ThreadEntity } from "@/lib/entities/thread.entity"

export class GetAnnouncementsUseCase {
    constructor(private threadRepository: ThreadRepository) { }

    async execute(limit = 3): Promise<ThreadEntity[]> {
        return await this.threadRepository.findAnnouncementsByBoardCode("tlg", limit)
    }
}
