import type { ReportRepository } from "@/lib/repositories/report.repository"

export class BulkResolveReportsUseCase {
  constructor(private reportRepository: ReportRepository) { }

  async execute(user: any, reportIds: number[], resolvedBy: string): Promise<void> {
    if (!user || (user.role !== "admin" && user.role !== "moderator" && user.role !== "janitor")) {
      throw new Error("Unauthorized: Pelaku bukan admin, moderator, atau janitor")
    }
    const filterBoardId = user.role === "janitor" ? (user.janitorBoards || []) : undefined;

    if (reportIds.length === 0) return

    await this.reportRepository.updateStatusBulk(reportIds, "resolved", resolvedBy, filterBoardId)
  }
}
