import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"

export const reportContentTypeEnum = pgEnum("report_content_type", [
  "thread",
  "reply",
])

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "resolved",
  "dismissed",
])

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),

    contentType: reportContentTypeEnum("content_type").notNull(),
    contentId: integer("content_id").notNull(),

    reason: text("reason").notNull(),
    status: reportStatusEnum("status").default("pending"),

    reportedAt: timestamp("reported_at", { withTimezone: true }).defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedBy: varchar("resolved_by", { length: 100 }),
    reporterIp: varchar("reporter_ip", { length: 45 }),
  },
  (t) => ({
    statusIdx: index("idx_reports_status").on(t.status),
    reporterIdx: index("idx_reports_reporter_ip").on(t.reporterIp, t.reportedAt),
    contentIdx: index("idx_reports_content").on(t.contentType, t.contentId),
  }),
)
