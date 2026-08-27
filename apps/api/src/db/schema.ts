import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['trial', 'paid', 'expired']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['created', 'paid', 'failed']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email'),
  displayName: text('display_name'),
  plan: planEnum('plan').notNull().default('trial'),
  // Lifetime count, for display only — not used to gate access.
  usageCount: integer('usage_count').notNull().default(0),
  // The actual gate: turns left to spend, topped up by recharge packs.
  // Starts with the free trial amount; never resets, never expires.
  turnsBalance: integer('turns_balance').notNull().default(10),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const purchases = pgTable(
  'purchases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    packId: text('pack_id').notNull(),
    amountInPaise: integer('amount_in_paise').notNull(),
    turns: integer('turns').notNull(),
    razorpayOrderId: text('razorpay_order_id').notNull().unique(),
    razorpayPaymentId: text('razorpay_payment_id'),
    status: purchaseStatusEnum('status').notNull().default('created'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('purchases_user_id_idx').on(table.userId)],
);

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
