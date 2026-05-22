import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import { generatePosterId } from "@/lib/utils/poster-id"
import type { ThreadUI } from "@/lib/entities/thread.entity"

export class SearchThreadsUseCase {
    constructor(private threadRepository: ThreadRepository) { }

    async execute(boardId: number, query: string): Promise<ThreadUI[]> {
        const results = await this.threadRepository.searchByBoardId(boardId, query)

        return results.map(t => ({
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
            isArchived: t.isArchived,
            bumpedAt: t.bumpedAt,
            image: t.image,
            imageMetadata: t.imageMetadata,
            postNumber: t.postNumber,
            posterId: generatePosterId(t.ipAddress, t.id),
        }))
    }
}
