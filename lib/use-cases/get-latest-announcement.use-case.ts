import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ThreadEntity } from "@/lib/entities/thread.entity"

export class GetLatestAnnouncementUseCase {
    constructor(private threadRepository: ThreadRepository) { }

    async execute(): Promise<ThreadEntity | null> {
        return await this.threadRepository.findLatestAnnouncementByBoardCode("tlg")
    }
}
