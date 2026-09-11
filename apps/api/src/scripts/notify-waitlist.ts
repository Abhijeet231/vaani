// Sends the "vaani is live" email to waitlist signups who haven't been
// notified yet, then marks them notified so a re-run only retries failures.
//
// Usage:
//   ts-node src/scripts/notify-waitlist.ts --test you@example.com        (send one preview, no DB writes)
//   ts-node src/scripts/notify-waitlist.ts --dry-run                     (list who WOULD be emailed, sends nothing)
//   ts-node src/scripts/notify-waitlist.ts --to a@x.com,b@y.com          (send only to these, if pending)
//   ts-node src/scripts/notify-waitlist.ts                               (real send, to everyone pending)
import '../config/dns-override';
import { and, eq, isNull, isNotNull } from 'drizzle-orm';
import { getDb } from '../config/db';
import { waitlistSignups } from '../db/schema';
import { sendWaitlistLaunchEmail } from '../services/email.service';

async function main() {
  const testAddress = process.argv.includes('--test')
    ? process.argv[process.argv.indexOf('--test') + 1]
    : null;

  if (testAddress) {
    console.log(`Sending preview to ${testAddress} (no DB writes)...`);
    await sendWaitlistLaunchEmail(testAddress);
    console.log('Sent.');
    return;
  }

  const dryRun = process.argv.includes('--dry-run');
  const toFlag = process.argv.includes('--to')
    ? process.argv[process.argv.indexOf('--to') + 1]
    : null;
  const onlyEmails = toFlag ? new Set(toFlag.split(',').map((e) => e.trim().toLowerCase())) : null;

  const db = getDb();
  let pending = await db.query.waitlistSignups.findMany({
    where: and(isNull(waitlistSignups.notifiedAt), isNotNull(waitlistSignups.email)),
  });
  if (onlyEmails) {
    pending = pending.filter((row) => onlyEmails.has(row.email!.toLowerCase()));
  }

  console.log(`${pending.length} signup(s) pending notification.`);
  if (dryRun) {
    for (const row of pending) console.log(`  would send -> ${row.email}`);
    return;
  }

  let sent = 0;
  let failed = 0;
  for (const row of pending) {
    try {
      await sendWaitlistLaunchEmail(row.email!);
      await db
        .update(waitlistSignups)
        .set({ notifiedAt: new Date() })
        .where(eq(waitlistSignups.id, row.id));
      sent++;
      console.log(`  sent -> ${row.email}`);
    } catch (e) {
      failed++;
      console.error(`  FAILED -> ${row.email}:`, e);
    }
  }
  console.log(`Done. sent=${sent} failed=${failed} (failed rows left unnotified for retry)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
