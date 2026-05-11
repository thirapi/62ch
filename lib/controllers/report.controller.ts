import type { GetReportsUseCase } from "@/lib/use-cases/get-reports.use-case"
import type { CreateReportUseCase } from "@/lib/use-cases/create-report.use-case"
import type { ReportRepository } from "@/lib/repositories/report.repository"

export class ReportController {
  constructor(
    private reportRepository: ReportRepository,
    private getReportsUseCase: GetReportsUseCase,
    private createReportUseCase: CreateReportUseCase,
  ) { }

  async createReport(request: { contentType: "thread" | "reply"; contentId: number; reason: string }) {
    if (!request.reason || request.reason.trim() === "") throw new Error("Alasan laporan harus diisi");
    return await this.createReportUseCase.execute(request);
  }

  async getReports() {
    try {
      const reports = await this.getReportsUseCase.execute()
      return { success: true, data: reports }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch reports",
      }
    }
  }
}
