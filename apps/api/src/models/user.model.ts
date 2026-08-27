import { eq, sql } from 'drizzle-orm';
import { getDb } from '../config/db';
import { users } from '../db/schema';

interface FindOrCreateUserInput {
  firebaseUid: string;
  email?: string;
  displayName?: string;
}

export async function findOrCreateUser(input: FindOrCreateUserInput) {
  const db = getDb();

  const existing = await db.query.users.findFirst({
    where: eq(users.firebaseUid, input.firebaseUid),
  });
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      firebaseUid: input.firebaseUid,
      email: input.email,
      displayName: input.displayName,
    })
    .returning();

  return created;
}

// Atomic (read-then-write would race two concurrent translate calls). Spends
// one turn and bumps the lifetime counter in the same update.
export async function spendTurn(userId: string) {
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({
      turnsBalance: sql`${users.turnsBalance} - 1`,
      usageCount: sql`${users.usageCount} + 1`,
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}

// Credits a purchased pack onto the balance and marks the account as having
// paid at least once (cosmetic — the balance itself is what actually gates).
export async function creditTurns(userId: string, turns: number) {
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({
      turnsBalance: sql`${users.turnsBalance} + ${turns}`,
      plan: 'paid',
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}
