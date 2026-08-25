import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['trial', 'paid', 'expired']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email'),
  displayName: text('display_name'),
  plan: planEnum('plan').notNull().default('trial'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
