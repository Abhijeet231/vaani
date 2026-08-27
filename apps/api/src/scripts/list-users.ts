// Prints every row in the `users` table. Uses the same neon-http driver +
// dns-override the app uses, so it works from this machine even though the
// Neon web console can't (that's a browser-side DNS problem, not a code one).
// Run: pnpm --filter api exec ts-node src/scripts/list-users.ts
import '../config/dns-override';
import { getDb } from '../config/db';
import { users } from '../db/schema';

async function main() {
  const rows = await getDb().select().from(users);
  console.log(`${rows.length} user(s):`);
  console.table(rows);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
