import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ReplyRepository } from "@/lib/repositories/reply.repository"

export interface MarkNsfwCommand {
    contentType: "thread" | "reply"
    contentId: number
}

export class MarkNsfwUseCase {
    constructor(
        private threadRepository: ThreadRepository,
        private replyRepository: ReplyRepository
    ) { }

    async execute(user: any, command: MarkNsfwCommand): Promise<void> {
        // Business rule: Check authorization
        if (!user || (user.role !== "admin" && user.role !== "moderator")) {
            throw new Error("Unauthorized: Pelaku bukan admin atau moderator")
        }

        if (command.contentType === "thread") {
            await this.threadRepository.updateNsfwStatus(command.contentId, true)
        } else {
            await this.replyRepository.updateNsfwStatus(command.contentId, true)
        }
    }
}
