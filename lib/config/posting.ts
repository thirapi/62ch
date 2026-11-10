/** Shared posting limits. Keep the client forms (maxLength) in sync. */
export const MAX_POST_LENGTH = 2000
export const MAX_SUBJECT_LENGTH = 200
export const POST_COOLDOWN_MS = 10_000

export const MAX_REPORT_REASON_LENGTH = 500
/** Max reports per IP inside REPORT_WINDOW_MS. */
export const REPORT_LIMIT = 5
export const REPORT_WINDOW_MS = 10 * 60 * 1000
