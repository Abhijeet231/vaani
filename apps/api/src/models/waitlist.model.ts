import { getDb } from '../config/db';
import { waitlistSignups } from '../db/schema';

interface CreateWaitlistSignupInput {
  email?: string | null;
  phone?: string | null;
}

/**
 * Inserts a waitlist signup. Returns the created row, or `null` if the email
 * or phone already exists (unique conflict on either column is ignored).
 */
export async function createWaitlistSignup(input: CreateWaitlistSignupInput) {
  const db = getDb();
  const [created] = await db
    .insert(waitlistSignups)
    .values({ email: input.email ?? null, phone: input.phone ?? null })
    .onConflictDoNothing()
    .returning();
  return created ?? null;
}
