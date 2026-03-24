import type { ReportRepository } from "@/lib/repositories/report.repository"

export class ResolveReportUseCase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(user: any, reportId: number, resolvedBy = "moderator"): Promise<void> {
    // Business rule: Check authorization
    if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
      throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
    }
    const filterBoardId = user.role === "janitor" ? (user.janitorBoards || []) : undefined;

    // Business rule: Mark report as resolved
    await this.reportRepository.updateStatus(reportId, "resolved", user.email || resolvedBy, filterBoardId)
  }
}
