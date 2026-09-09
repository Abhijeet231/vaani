import { and, eq, ne } from 'drizzle-orm';
import { getDb } from '../config/db';
import { purchases } from '../db/schema';

interface CreatePurchaseInput {
  userId: string;
  packId: string;
  amountInPaise: number;
  turns: number;
  razorpayOrderId: string;
}

export async function createPurchase(input: CreatePurchaseInput) {
  const db = getDb();
  const [created] = await db.insert(purchases).values(input).returning();
  return created;
}

export async function listPurchasesByUser(userId: string) {
  const db = getDb();
  return db.query.purchases.findMany({
    where: eq(purchases.userId, userId),
    orderBy: (purchase, { desc }) => [desc(purchase.createdAt)],
  });
}

export async function findPurchaseByOrderId(razorpayOrderId: string) {
  const db = getDb();
  return db.query.purchases.findFirst({ where: eq(purchases.razorpayOrderId, razorpayOrderId) });
}

// Claims a purchase for crediting. The `status <> 'paid'` in the WHERE is the
// whole point: two callers can legitimately confirm the same order at once —
// the browser hitting /payments/verify and Razorpay's webhook arriving — and
// a read-then-write would let both see 'created' and credit the pack twice.
// Postgres serialises the conditional UPDATE, so exactly one caller gets a row
// back; the loser gets undefined and must not credit.
export async function claimPurchaseForCrediting(id: string, razorpayPaymentId: string) {
  const db = getDb();
  const [updated] = await db
    .update(purchases)
    .set({ status: 'paid', razorpayPaymentId })
    .where(and(eq(purchases.id, id), ne(purchases.status, 'paid')))
    .returning();
  return updated;
}

// Only ever moves a purchase that is still 'created' — a payment.failed webhook
// for an order that was already captured and credited must not undo it.
export async function markPurchaseFailed(id: string) {
  const db = getDb();
  const [updated] = await db
    .update(purchases)
    .set({ status: 'failed' })
    .where(and(eq(purchases.id, id), eq(purchases.status, 'created')))
    .returning();
  return updated;
}

