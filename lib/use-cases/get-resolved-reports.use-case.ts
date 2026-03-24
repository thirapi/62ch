import type { ReportRepository } from "@/lib/repositories/report.repository"
import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ReplyRepository } from "@/lib/repositories/reply.repository"
import type { BanRepository } from "@/lib/repositories/ban.repository"
import type { BoardRepository } from "@/lib/repositories/board.repository"

interface ReportWithContent {
    id: number
    contentType: "thread" | "reply"
    contentId: number
    reason: string
    reportedAt: Date
    content: string
    author: string
    ipAddress?: string | null
    status: string
    isLocked?: boolean
    isPinned?: boolean
    isBanned?: boolean
    resolvedAt?: Date
    boardCode?: string
    parentThreadId?: number
    postNumber?: number
    image?: string
    imageMetadata?: any
}

export class GetResolvedReportsUseCase {
    constructor(
        private reportRepository: ReportRepository,
        private threadRepository: ThreadRepository,
        private replyRepository: ReplyRepository,
        private banRepository: BanRepository,
        private boardRepository: BoardRepository,
    ) { }

    async execute(user: any, options: { limit?: number; offset?: number; boardId?: number } = {}): Promise<{ reports: ReportWithContent[]; total: number }> {
        const { limit = 50, offset = 0, boardId } = options

        // Business rule: Check authorization
        if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
            throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
        }

        let filterBoardId = boardId as number | number[] | undefined;
        if (user.role === "janitor") {
            const janitorBoards: number[] = user.janitorBoards || [];
            if (boardId) {
                if (!janitorBoards.includes(boardId)) {
                    return { reports: [], total: 0 }; // No access
                }
            } else {
                filterBoardId = janitorBoards;
            }
        }

        const [reports, total] = await Promise.all([
            this.reportRepository.findResolvedPaged(limit, offset, filterBoardId),
            this.reportRepository.countResolved(filterBoardId)
        ])

        if (reports.length === 0) {
            return { reports: [], total }
        }

        // 1. Collect all IDs to batch fetch
        const threadIds = new Set<number>()
        const replyIds = new Set<number>()

        reports.forEach(r => {
            if (r.contentType === "thread") threadIds.add(r.contentId)
            else replyIds.add(r.contentId)
        })

        // 2. Batch fetch Threads and Replies
        const [threads, replies] = await Promise.all([
            this.threadRepository.findManyByIds(Array.from(threadIds)),
            this.replyRepository.findManyByIds(Array.from(replyIds))
        ])

        const threadMap = new Map(threads.map(t => [t.id, t]))
        const replyMap = new Map(replies.map(r => [r.id, r]))

        // 3. Collect Board IDs from fetched content (and missing parent threads)
        const boardIds = new Set<number>()
        const missingParentThreadIds = Array.from(new Set(
            replies.filter(r => !threadMap.has(r.threadId)).map(r => r.threadId)
        ))

        if (missingParentThreadIds.length > 0) {
            const additionalThreads = await this.threadRepository.findManyByIds(missingParentThreadIds)
            additionalThreads.forEach(t => threadMap.set(t.id, t))
        }

        threadMap.forEach(t => boardIds.add(t.boardId))

        // 4. Batch fetch Boards and Bans (IPs)
        const ipAddresses = new Set<string>()
        threads.forEach(t => t.ipAddress && ipAddresses.add(t.ipAddress))
        replies.forEach(r => r.ipAddress && ipAddresses.add(r.ipAddress))

        const [boards, activeBans] = await Promise.all([
            this.boardRepository.findManyByIds(Array.from(boardIds)),
            this.banRepository.findActiveByIps(Array.from(ipAddresses))
        ])

        const boardMap = new Map(boards.map(b => [b.id, b]))
        const banMap = new Map(activeBans.map(b => [b.ipAddress, b]))

        // 5. Build final objects
        const reportsWithContent = reports.map((report): ReportWithContent => {
            const isThread = report.contentType === "thread"
            const content = isThread ? threadMap.get(report.contentId) : replyMap.get(report.contentId)
            const parentThread = isThread ? (content as any) : threadMap.get((content as any)?.threadId)
            const board = parentThread ? boardMap.get(parentThread.boardId) : null
            const ipAddress = content?.ipAddress
            const isBanned = ipAddress ? banMap.has(ipAddress) : false

            return {
                id: report.id,
                contentType: report.contentType,
                contentId: report.contentId,
                reason: report.reason,
                reportedAt: report.reportedAt,
                content: content?.content || "[Deleted]",
                author: content?.author || "Unknown",
                ipAddress: ipAddress,
                status: report.status,
                isLocked: isThread ? (content as any)?.isLocked : undefined,
                isPinned: isThread ? (content as any)?.isPinned : undefined,
                isBanned,
                resolvedAt: report.resolvedAt,
                boardCode: board?.code,
                parentThreadId: parentThread?.id,
                postNumber: content?.postNumber,
                image: content?.image ?? undefined,
                imageMetadata: content?.imageMetadata,
            }
        })

        return { reports: reportsWithContent, total }
    }
}
