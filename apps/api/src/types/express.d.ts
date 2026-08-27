import type { users } from '../db/schema';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
      };
      // Set by requireUsageAvailable, so downstream handlers don't re-query
      // the row it already had to load to check the trial limit.
      dbUser?: typeof users.$inferSelect;
    }
  }
}
