import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { threads } from './threads'

export const replies = pgTable(
  'replies',
  {
    id: serial('id').primaryKey(),
    postNumber: integer('post_number').unique(),

    threadId: integer('thread_id')
      .notNull()
      .references(() => threads.id, { onDelete: 'cascade' }),

    content: text('content').notNull(),
    author: varchar('author', { length: 100 }).default('Awanama'),

    image: text('image'),
    imageMetadata: text('image_metadata'),
    deletionPassword: varchar('deletion_password', { length: 255 }),

    isDeleted: boolean('is_deleted').default(false),
    isNsfw: boolean('is_nsfw').default(false),
    isSpoiler: boolean('is_spoiler').default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    ipAddress: varchar('ip_address', { length: 45 }),
    capcode: varchar('capcode', { length: 20 }),
  },
  (t) => ({
    threadIdx: index('idx_replies_thread_id').on(t.threadId),
    deletedIdx: index('idx_replies_is_deleted').on(t.isDeleted),
    createdIdx: index('idx_replies_created_at').on(t.createdAt),
    threadViewIdx: index('idx_replies_thread_view').on(
      t.threadId,
      t.isDeleted,
      t.createdAt
    ),
  })
)
