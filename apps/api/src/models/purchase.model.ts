import { eq } from 'drizzle-orm';
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

export async function markPurchasePaid(id: string, razorpayPaymentId: string) {
  const db = getDb();
  const [updated] = await db
    .update(purchases)
    .set({ status: 'paid', razorpayPaymentId })
    .where(eq(purchases.id, id))
    .returning();
  return updated;
}
