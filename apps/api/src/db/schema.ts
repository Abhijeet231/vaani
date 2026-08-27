import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['trial', 'paid', 'expired']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email'),
  displayName: text('display_name'),
  plan: planEnum('plan').notNull().default('trial'),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    sourceLanguage: text('source_language').notNull(),
    targetLanguage: text('target_language').notNull(),
    transcript: text('transcript').notNull(),
    translatedText: text('translated_text').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('conversations_user_id_idx').on(table.userId)],
);
