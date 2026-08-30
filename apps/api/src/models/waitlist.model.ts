import { sql } from 'drizzle-orm';
import { getDb } from '../config/db';
import { waitlistSignups } from '../db/schema';

interface CreateWaitlistSignupInput {
  email?: string | null;
  phone?: string | null;
}

interface WaitlistSignupResult {
  // The created row, or null if the email/phone was already on the list.
  created: typeof waitlistSignups.$inferSelect | null;
  // Total signups after this call — used as the "you're #N in line" number.
  total: number;
}

export async function createWaitlistSignup(
  input: CreateWaitlistSignupInput,
): Promise<WaitlistSignupResult> {
  const db = getDb();
  const [created] = await db
    .insert(waitlistSignups)
    .values({ email: input.email ?? null, phone: input.phone ?? null })
    .onConflictDoNothing()
    .returning();
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(waitlistSignups);
  return { created: created ?? null, total: count };
}
