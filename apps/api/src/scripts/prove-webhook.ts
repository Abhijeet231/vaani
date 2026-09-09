// Throwaway proof for the Razorpay webhook. Inserts a real purchase row for an
// existing user, fires signed webhook events at the running API, and checks the
// balance moved exactly once. Deletes the row afterwards.
import '../config/dns-override';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '../config/db';
import { env } from '../config/env';
import { purchases, users } from '../db/schema';

const API = 'http://127.0.0.1:3000/api/payments/webhook';
const ORDER = `order_probe_${Date.now()}`;

function sign(body: string) {
  return crypto.createHmac('sha256', env.razorpayWebhookSecret!).update(body).digest('hex');
}

async function fire(event: string, orderId: string) {
  const body = JSON.stringify({
    event,
    payload: { payment: { entity: { id: `pay_probe_${Date.now()}`, order_id: orderId } } },
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

  // Razorpay retries, and sends order.paid for the same payment — neither may credit again.
  console.log(await fire('payment.captured', ORDER));
  console.log(await fire('order.paid', ORDER));
  const afterDup = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  console.log(`after retry + order.paid: balance=${afterDup!.turnsBalance} (expect still ${before + 150})`);

  console.log(await fire('payment.captured', 'order_not_ours_xyz'));
  console.log(await fire('payment.failed', ORDER));
  const rowFailed = await db.query.purchases.findFirst({ where: eq(purchases.id, row.id) });
  console.log(`payment.failed on a paid row: status=${rowFailed!.status} (expect paid, unchanged)`);

  await db.delete(purchases).where(eq(purchases.id, row.id));
  await db.update(users).set({ turnsBalance: before, plan: user.plan }).where(eq(users.id, user.id));
  const restored = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  console.log(`cleaned up: probe row deleted, balance restored to ${restored!.turnsBalance}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
