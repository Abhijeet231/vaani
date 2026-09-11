// Same proof as prove-webhook.ts but aimed at the deployed Render API instead
// of localhost. Takes the webhook secret as an argv, not env — this hits
// production, so it shouldn't silently pick up whatever's in the local .env.
// Deletes its own test data afterward; safe to re-run.
//   ts-node src/scripts/prove-webhook-live.ts <razorpay-webhook-secret>
import '../config/dns-override';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '../config/db';
import { purchases, users } from '../db/schema';

const API = 'https://vaani-api-gx49.onrender.com/api/payments/webhook';
const SECRET = process.argv[2];
if (!SECRET) throw new Error('usage: ts-node prove-webhook-live.ts <webhook-secret>');
const ORDER = `order_probe_live_${Date.now()}`;

function sign(body: string) {
  return crypto.createHmac('sha256', SECRET).update(body).digest('hex');
}

async function fire(event: string, orderId: string) {
  const body = JSON.stringify({
    event,
    payload: { payment: { entity: { id: `pay_probe_live_${Date.now()}`, order_id: orderId } } },
  });
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': sign(body) },
    body,
  });
  return `${event} -> HTTP ${res.status} ${JSON.stringify(await res.json())}`;
}

async function main() {
  const db = getDb();
  const user = await db.query.users.findFirst();
  if (!user) throw new Error('no users in db');

  const before = user.turnsBalance;
  const [row] = await db
    .insert(purchases)
    .values({
      userId: user.id,
      packId: 'starter',
      amountInPaise: 9900,
      turns: 150,
      razorpayOrderId: ORDER,
    })
    .returning();
  console.log(`user ${user.email} balance before: ${before}, purchase ${row.id} status=${row.status}`);

  console.log(await fire('payment.captured', ORDER));
  const afterOne = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  const rowOne = await db.query.purchases.findFirst({ where: eq(purchases.id, row.id) });
  console.log(`after 1st: balance=${afterOne!.turnsBalance} (expect ${before + 150}), status=${rowOne!.status}, paymentId=${rowOne!.razorpayPaymentId}`);

  console.log(await fire('payment.captured', ORDER));
  console.log(await fire('order.paid', ORDER));
  const afterDup = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  console.log(`after retry + order.paid: balance=${afterDup!.turnsBalance} (expect still ${before + 150})`);

  console.log(await fire('payment.captured', 'order_not_ours_xyz'));
  console.log(await fire('payment.failed', ORDER));
  const rowFailed = await db.query.purchases.findFirst({ where: eq(purchases.id, row.id) });
  console.log(`payment.failed on a paid row: status=${rowFailed!.status} (expect paid, unchanged)`);

  const badSigRes = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': 'deadbeef' },
    body: JSON.stringify({ event: 'payment.captured', payload: {} }),
  });
  console.log(`bad signature -> HTTP ${badSigRes.status}`);

  await db.delete(purchases).where(eq(purchases.id, row.id));
  await db.update(users).set({ turnsBalance: before, plan: user.plan }).where(eq(users.id, user.id));
  const restored = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  console.log(`cleaned up: probe row deleted, balance restored to ${restored!.turnsBalance}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
