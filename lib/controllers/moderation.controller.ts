import type { LockThreadUseCase } from "@/lib/use-cases/lock-thread.use-case"
import type { UnlockThreadUseCase } from "@/lib/use-cases/unlock-thread.use-case"
import type { PinThreadUseCase } from "@/lib/use-cases/pin-thread.use-case"
import type { UnpinThreadUseCase } from "@/lib/use-cases/unpin-thread.use-case"
import type { SoftDeleteThreadUseCase } from "@/lib/use-cases/soft-delete-thread.use-case"
import type { SoftDeleteReplyUseCase } from "@/lib/use-cases/soft-delete-reply.use-case"
import type { ResolveReportUseCase } from "@/lib/use-cases/resolve-report.use-case"
import type { DismissReportUseCase } from "@/lib/use-cases/dismiss-report.use-case"
import type { GetPendingReportsUseCase } from "@/lib/use-cases/get-pending-reports.use-case"
import type { GetResolvedReportsUseCase } from "@/lib/use-cases/get-resolved-reports.use-case"
import type { BanUserUseCase } from "@/lib/use-cases/ban-user.use-case"
import type { UnbanUserUseCase } from "@/lib/use-cases/unban-user.use-case"
import type { MarkNsfwUseCase } from "@/lib/use-cases/mark-nsfw.use-case"
import type { GetBansUseCase } from "@/lib/use-cases/get-bans.use-case"
import type { UpdateBanUseCase } from "@/lib/use-cases/update-ban.use-case"

export class ModerationController {
  constructor(
    private lockThreadUseCase: LockThreadUseCase,
    private unlockThreadUseCase: UnlockThreadUseCase,
    private pinThreadUseCase: PinThreadUseCase,
    private unpinThreadUseCase: UnpinThreadUseCase,
    private softDeleteThreadUseCase: SoftDeleteThreadUseCase,
    private softDeleteReplyUseCase: SoftDeleteReplyUseCase,
    private resolveReportUseCase: ResolveReportUseCase,
    private dismissReportUseCase: DismissReportUseCase,
    private getPendingReportsUseCase: GetPendingReportsUseCase,
    private getResolvedReportsUseCase: GetResolvedReportsUseCase,
    private banUserUseCase: BanUserUseCase,
    private unbanUserUseCase: UnbanUserUseCase,
    private markNsfwUseCase: MarkNsfwUseCase,
    private getBansUseCase: GetBansUseCase,
    private updateBanUseCase: UpdateBanUseCase,
  ) { }

  async lockThread(user: any, threadId: number) {
    // Input validation only
    if (!threadId) {
      throw new Error("Thread ID is required")
    }

    // Call use case
    await this.lockThreadUseCase.execute(user, threadId)
    return { success: true }
  }

  async unlockThread(user: any, threadId: number) {
    // Input validation only
    if (!threadId) {
      throw new Error("Thread ID is required")
    }

    // Call use case
    await this.unlockThreadUseCase.execute(user, threadId)
    return { success: true }
  }

  async pinThread(user: any, threadId: number) {
    // Input validation only
    if (!threadId) {
      throw new Error("Thread ID is required")
    }

    // Call use case
    await this.pinThreadUseCase.execute(user, threadId)
    return { success: true }
  }

  async unpinThread(user: any, threadId: number) {
    // Input validation only
    if (!threadId) {
      throw new Error("Thread ID is required")
    }

    // Call use case
    await this.unpinThreadUseCase.execute(user, threadId)
    return { success: true }
  }

  async deleteThread(user: any, threadId: number) {
    // Input validation only
    if (!threadId) {
      throw new Error("Thread ID is required")
    }

    // Call use case
    const thread = await this.softDeleteThreadUseCase.execute(user, threadId)
    return { success: true, thread }
  }

  async deleteReply(user: any, replyId: number) {
    // Input validation only
    if (!replyId) {
      throw new Error("Reply ID is required")
    }

    // Call use case
    const reply = await this.softDeleteReplyUseCase.execute(user, replyId)
    return { success: true, reply }
  }

  async resolveReport(user: any, reportId: number, resolvedBy: string) {
    // Input validation only
    if (!reportId) {
      throw new Error("Report ID is required")
    }

    // Call use case
    await this.resolveReportUseCase.execute(user, reportId, resolvedBy)
    return { success: true }
  }

  async dismissReport(user: any, reportId: number, resolvedBy: string) {
    // Input validation only
    if (!reportId) {
      throw new Error("Report ID is required")
    }

    // Call use case
    await this.dismissReportUseCase.execute(user, reportId, resolvedBy)
    return { success: true }
  }

  async getPendingReports(user: any) {
    // Call use case
    return await this.getPendingReportsUseCase.execute(user)
  }

  async getResolvedReports(user: any) {
    return await this.getResolvedReportsUseCase.execute(user)
  }

  async banUser(user: any, ipAddress: string, reason?: string, durationHours?: number) {
    if (!ipAddress) throw new Error("IP Address is required")
    await this.banUserUseCase.execute(user, { ipAddress, reason, durationHours })
    return { success: true }
  }

  async unbanUser(user: any, ipAddress: string) {
    if (!ipAddress) throw new Error("IP Address is required")
    await this.unbanUserUseCase.execute(user, ipAddress)
    return { success: true }
  }

  async markAsNsfw(user: any, contentType: "thread" | "reply", contentId: number) {
    if (!contentId) throw new Error("Content ID is required")
    await this.markNsfwUseCase.execute(user, { contentType, contentId })
    return { success: true }
  }

  async getBans(user: any) {
    return await this.getBansUseCase.execute(user)
  }

  async updateBan(user: any, id: number, reason?: string, durationHours?: number | null) {
    if (!id) throw new Error("Ban ID is required")
    await this.updateBanUseCase.execute(user, { id, reason, durationHours })
    return { success: true }
  }
}
