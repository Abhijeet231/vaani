import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from './env';
import * as schema from '../db/schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

let db: Db | null = null;

export function getDb(): Db {
  if (!db) {
    if (!env.databaseUrl) {
      throw new Error('DATABASE_URL is not set — add it to apps/api/.env');
    }
    db = drizzle(neon(env.databaseUrl), { schema });
  }
  return db;
}
