import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { boards } from './boards'

export const threads = pgTable(
  'threads',
  {
    id: serial('id').primaryKey(),
    postNumber: integer('post_number').unique(),

    boardId: integer('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),

    subject: varchar('subject', { length: 200 }),
    content: text('content').notNull(),
    author: varchar('author', { length: 100 }).default('Awanama'),

    image: text('image'),
    imageMetadata: text('image_metadata'), // Store as JSON string or plain text for now if JSONB is not imported
    deletionPassword: varchar('deletion_password', { length: 255 }),

    isDeleted: boolean('is_deleted').default(false),

    isPinned: boolean('is_pinned').default(false),
    isLocked: boolean('is_locked').default(false),
    isArchived: boolean('is_archived').default(false),
    isNsfw: boolean('is_nsfw').default(false),
    isSpoiler: boolean('is_spoiler').default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    bumpedAt: timestamp('bumped_at', { withTimezone: true }).defaultNow(),
    ipAddress: varchar('ip_address', { length: 45 }),
    capcode: varchar('capcode', { length: 20 }),
  },
  (t) => ({
    boardIdx: index('idx_threads_board_id').on(t.boardId),
    bumpedIdx: index('idx_threads_bumped_at').on(t.bumpedAt),
    archivedIdx: index('idx_threads_is_archived').on(t.isArchived),
    deletedIdx: index('idx_threads_is_deleted').on(t.isDeleted),
    createdIdx: index('idx_threads_created_at').on(t.createdAt),
    boardViewIdx: index('idx_threads_board_view').on(
      t.boardId,
      t.isDeleted,
      t.isArchived,
      t.isPinned,
      t.bumpedAt
    ),
  })
)
