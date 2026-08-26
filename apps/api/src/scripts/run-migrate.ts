// drizzle-kit's own `migrate` CLI requires a WebSocket-capable Neon driver,
// which fails outright on this ISP's DNS (see dns-override.ts). drizzle-orm
// ships an HTTP-compatible migrator for the same neon-http driver the app
// uses at runtime — run migrations through that instead. Re-run this
// whenever a new migration is generated (`pnpm db:generate`) and needs
// applying: `pnpm --filter api exec ts-node src/scripts/run-migrate.ts`.
import '../config/dns-override';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { env } from '../config/env';

async function main() {
  if (!env.databaseUrl) throw new Error('DATABASE_URL is not set');
  const db = drizzle(neon(env.databaseUrl));
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migration applied.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
