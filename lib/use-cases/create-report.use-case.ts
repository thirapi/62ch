import type { ReportRepository } from "@/lib/repositories/report.repository"
import type { CreateReportInput } from "@/lib/entities/report.entity"
import { MAX_REPORT_REASON_LENGTH } from "../config/posting"

export class CreateReportUseCase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(input: CreateReportInput): Promise<number> {
    // Business rule: Validate reason is not empty
    const reason = typeof input.reason === "string" ? input.reason.trim() : ""
    if (reason.length < 1) {
      throw new Error("Alasan laporan harus diisi")
    }

    // Business rule: Validate reason length
    if (reason.length > MAX_REPORT_REASON_LENGTH) {
      throw new Error(`Alasan laporan terlalu panjang (maksimum ${MAX_REPORT_REASON_LENGTH} karakter)`)
    }

    // Create report
    const report = await this.reportRepository.create({ ...input, reason })
    return report.id
  }
}
