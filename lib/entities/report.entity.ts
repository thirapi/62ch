export interface ReportEntity {
  id: number
  contentType: "thread" | "reply"
  contentId: number
  reason: string
  reportedAt: Date
  status: "pending" | "resolved" | "dismissed"
  resolvedAt?: Date
  resolvedBy?: string
}

export interface CreateReportInput {
  contentType: "thread" | "reply"
  contentId: number
  reason: string
  reporterIp?: string
}
