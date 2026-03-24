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
        if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
            throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
        }

        if (command.contentType === "thread") {
            if (user.role === "janitor") {
                const thread = await this.threadRepository.findById(command.contentId);
                if (!thread || !user.janitorBoards?.includes(thread.boardId)) {
                    throw new Error("Unauthorized: Janitor tidak memiliki akses ke board ini");
                }
            }
            await this.threadRepository.updateNsfwStatus(command.contentId, true)
        } else {
            if (user.role === "janitor") {
                const reply = await this.replyRepository.findById(command.contentId);
                if (!reply) throw new Error("Reply not found");
                const thread = await this.threadRepository.findById(reply.threadId);
                if (!thread || !user.janitorBoards?.includes(thread.boardId)) {
                    throw new Error("Unauthorized: Janitor tidak memiliki akses ke board ini");
                }
            }
            await this.replyRepository.updateNsfwStatus(command.contentId, true)
        }
    }
}
