import { pgTable, text, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['admin', 'moderator', 'janitor', 'user'])

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  role: userRole('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
