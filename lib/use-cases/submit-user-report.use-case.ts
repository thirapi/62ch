import type { ReportRepository } from "@/lib/repositories/report.repository"
import type { BanRepository } from "@/lib/repositories/ban.repository"
import type { ThreadRepository } from "@/lib/repositories/thread.repository"
import type { ReplyRepository } from "@/lib/repositories/reply.repository"
import type { CreateReportUseCase } from "./create-report.use-case"
import { REPORT_LIMIT, REPORT_WINDOW_MS } from "../config/posting"

export interface SubmitUserReportInput {
  contentType: "thread" | "reply"
  contentId: number
  reason: string
  reporterIp: string
}

/**
 * Public report entry point (anonymous users). Adds abuse protection on top
 * of CreateReportUseCase, which stays unrestricted for internal callers such
 * as AI moderation.
 */
export class SubmitUserReportUseCase {
  constructor(
    private reportRepository: ReportRepository,
    private banRepository: BanRepository,
    private threadRepository: ThreadRepository,
    private replyRepository: ReplyRepository,
    private createReportUseCase: CreateReportUseCase,
  ) {}

  async execute(input: SubmitUserReportInput): Promise<number> {
    if (input.contentType !== "thread" && input.contentType !== "reply") {
      throw new Error("Jenis konten tidak valid.")
    }
    if (!Number.isSafeInteger(input.contentId) || input.contentId <= 0) {
      throw new Error("Konten tidak ditemukan.")
    }

    const ban = await this.banRepository.findByIp(input.reporterIp)
    if (ban) {
      throw new Error("IP Anda sedang diblokir dan tidak dapat mengirim laporan.")
    }

    const target =
      input.contentType === "thread"
        ? await this.threadRepository.findById(input.contentId)
        : await this.replyRepository.findById(input.contentId)
    if (!target || target.isDeleted) {
      throw new Error("Konten tidak ditemukan atau sudah dihapus.")
    }

    if (
      await this.reportRepository.hasPendingFromReporter(
        input.reporterIp,
        input.contentType,
        input.contentId,
      )
    ) {
      throw new Error("Anda sudah melaporkan konten ini. Moderator akan meninjaunya.")
    }

    const recent = await this.reportRepository.countByReporterIpSince(
      input.reporterIp,
      new Date(Date.now() - REPORT_WINDOW_MS),
    )
    if (recent >= REPORT_LIMIT) {
      throw new Error("Terlalu banyak laporan. Silakan coba lagi beberapa menit lagi.")
    }

    return this.createReportUseCase.execute({
      contentType: input.contentType,
      contentId: input.contentId,
      reason: input.reason,
      reporterIp: input.reporterIp,
    })
  }
}
