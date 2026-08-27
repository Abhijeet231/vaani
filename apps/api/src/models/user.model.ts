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

// Atomic increment (read-then-write would race two concurrent translate calls).
export async function incrementUsageCount(userId: string) {
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({ usageCount: sql`${users.usageCount} + 1` })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}
