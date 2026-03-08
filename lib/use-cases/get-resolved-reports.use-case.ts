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
}

export class GetResolvedReportsUseCase {
    constructor(
        private reportRepository: ReportRepository,
        private threadRepository: ThreadRepository,
        private replyRepository: ReplyRepository,
        private banRepository: BanRepository,
        private boardRepository: BoardRepository,
    ) { }

    async execute(user: any): Promise<ReportWithContent[]> {
        // Business rule: Check authorization
        if (!user || (user.role !== "admin" && user.role !== "moderator")) {
            throw new Error("Unauthorized: Pelaku bukan admin atau moderator")
        }

        const reports = await this.reportRepository.findResolved()

        const reportsWithContent = await Promise.all(
            reports.map(async (report) => {
                const ipAddress = report.contentType === "thread"
                    ? (await this.threadRepository.findById(report.contentId))?.ipAddress
                    : (await this.replyRepository.findById(report.contentId))?.ipAddress

                let isBanned = false
                if (ipAddress) {
                    const ban = await this.banRepository.findByIp(ipAddress)
                    isBanned = !!ban
                }

                if (report.contentType === "thread") {
                    const thread = await this.threadRepository.findById(report.contentId)
                    const board = thread ? await this.boardRepository.findById(thread.boardId) : null
                    return {
                        id: report.id,
                        contentType: report.contentType,
                        contentId: report.contentId,
                        reason: report.reason,
                        reportedAt: report.reportedAt,
                        content: thread?.content || "[Deleted]",
                        author: thread?.author || "Unknown",
                        ipAddress: thread?.ipAddress,
                        status: report.status,
                        isLocked: thread?.isLocked,
                        isPinned: thread?.isPinned,
                        isBanned,
                        resolvedAt: report.resolvedAt,
                        boardCode: board?.code,
                        parentThreadId: thread?.id,
                        postNumber: thread?.postNumber,
                    }
                } else {
                    const reply = await this.replyRepository.findById(report.contentId)
                    const thread = reply ? await this.threadRepository.findById(reply.threadId) : null
                    const board = thread ? await this.boardRepository.findById(thread.boardId) : null
                    return {
                        id: report.id,
                        contentType: report.contentType,
                        contentId: report.contentId,
                        reason: report.reason,
                        reportedAt: report.reportedAt,
                        content: reply?.content || "[Deleted]",
                        author: reply?.author || "Unknown",
                        ipAddress: reply?.ipAddress,
                        status: report.status,
                        isBanned,
                        resolvedAt: report.resolvedAt,
                        boardCode: board?.code,
                        parentThreadId: reply?.threadId,
                        postNumber: reply?.postNumber,
                    }
                }
            }),
        )

        return reportsWithContent
    }
}
