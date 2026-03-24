import { pgTable, serial, text, integer, timestamp, index, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { boards } from './boards'

export const boardJanitors = pgTable(
  'board_janitors',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    boardId: integer('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    userIdIdx: index('idx_board_janitors_user_id').on(t.userId),
    boardIdIdx: index('idx_board_janitors_board_id').on(t.boardId),
    uniqueUserBoard: unique('unq_board_janitors_user_board').on(t.userId, t.boardId)
  })
)
