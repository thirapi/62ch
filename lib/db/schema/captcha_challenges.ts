import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core'

/**
 * Server-side captcha state. The client only ever sees the random id;
 * the answer never leaves the server and each row is consumed on first use.
 */
export const captchaChallenges = pgTable(
  'captcha_challenges',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    answer: varchar('answer', { length: 16 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => [index('idx_captcha_challenges_expires_at').on(t.expiresAt)]
)
