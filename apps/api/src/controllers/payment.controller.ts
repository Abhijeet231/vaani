import { NextFunction, Request, Response } from 'express';
import { getRazorpay } from '../config/razorpay';
import { env } from '../config/env';
import { getPack, RECHARGE_PACKS } from '../config/pricing';
import { findOrCreateUser, creditTurns } from '../models/user.model';
import {
  claimPurchaseForCrediting,
  createPurchase,
  findPurchaseByOrderId,
  listPurchasesByUser,
  markPurchaseFailed,
} from '../models/purchase.model';
import {
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from '../services/payment.service';

// Only the handful of fields the handler below reads. Razorpay sends a great
// deal more, and which sub-entity is populated depends on the event.
interface RazorpayWebhookEvent {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
}

export function listPacks(_req: Request, res: Response): void {
  res.json({ packs: RECHARGE_PACKS });
}

export async function listPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await findOrCreateUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name,
    });
    const purchases = await listPurchasesByUser(user.id);

    res.json({
      purchases: purchases.map((purchase) => ({
        id: purchase.id,
        packId: purchase.packId,
        packLabel: getPack(purchase.packId)?.label ?? purchase.packId,
        amountInPaise: purchase.amountInPaise,
        turns: purchase.turns,
        status: purchase.status,
        createdAt: purchase.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const packId = typeof req.body?.packId === 'string' ? req.body.packId : undefined;
  const pack = packId ? getPack(packId) : undefined;
  if (!pack) {
    res.status(400).json({ error: 'Unknown pack id' });
    return;
  }

  try {
    const user = await findOrCreateUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name,
    });

    const order = await getRazorpay().orders.create({
      amount: pack.priceInPaise,
      currency: 'INR',
      receipt: `${pack.id}_${Date.now()}`,
    });

    await createPurchase({
      userId: user.id,
      packId: pack.id,
      amountInPaise: pack.priceInPaise,
      turns: pack.turns,
      razorpayOrderId: order.id,
    });

    res.status(200).json({
      orderId: order.id,
      amount: pack.priceInPaise,
      currency: 'INR',
      keyId: env.razorpayKeyId,
      packLabel: pack.label,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: 'Missing razorpay_order_id/razorpay_payment_id/razorpay_signature' });
    return;
  }

  try {
    const purchase = await findPurchaseByOrderId(razorpay_order_id);
    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    const user = await findOrCreateUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name,
    });
    if (purchase.userId !== user.id) {
      res.status(403).json({ error: 'This purchase does not belong to you' });
      return;
    }

    // Already settled — by an earlier call of this route, or by the webhook.
    // Nothing to do but report the balance.
    if (purchase.status === 'paid') {
      res.status(200).json({ turnsBalance: user.turnsBalance });
      return;
    }

    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    const credited = await creditPurchaseOnce(purchase.id, purchase.userId, purchase.turns, razorpay_payment_id);
    if (!credited) {
      // The webhook landed between the read above and the claim. It already
      // credited, so re-read rather than reporting the now-stale balance.
      const fresh = await findOrCreateUser({
        firebaseUid: req.user.uid,
        email: req.user.email,
        displayName: req.user.name,
      });
      res.status(200).json({ turnsBalance: fresh.turnsBalance });
      return;
    }

    res.status(200).json({ turnsBalance: credited.turnsBalance });
  } catch (err) {
    next(err);
  }
}

// Razorpay's server-to-server confirmation. This exists because /payments/verify
// above is driven by the browser: a user who pays and then closes the tab, loses
// signal or hits a JS error is charged and gets nothing. The webhook is sent by
// Razorpay independently of that tab and retried on failure, so it is the path
// that actually guarantees crediting; /verify stays because it is synchronous
// and lets the UI show the new balance immediately.
//
// Unauthenticated by design — the caller is Razorpay, not a signed-in user, and
// the HMAC over the raw body is what authenticates it.
export async function handleRazorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!env.razorpayWebhookSecret) {
    // Loud, and a 5xx so Razorpay retries after the secret is configured
    // instead of dropping the event.
    console.error('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set');
    res.status(503).json({ error: 'Webhook not configured' });
    return;
  }

  const signature = req.header('x-razorpay-signature');
  // express.raw is mounted on this path in app.ts, so the body is the exact
  // bytes Razorpay signed. If it is anything else the raw parser did not run
  // and no signature check would be trustworthy.
  const rawBody = req.body;
  if (!signature || !Buffer.isBuffer(rawBody)) {
    res.status(400).json({ error: 'Missing signature or raw body' });
    return;
  }

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    res.status(400).json({ error: 'Malformed webhook body' });
    return;
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id ?? event.payload?.order?.entity?.id;

  try {
    switch (event.event) {
      case 'payment.captured':
      case 'order.paid': {
        if (!orderId) break;
        const purchase = await findPurchaseByOrderId(orderId);
        // An order we have no row for is not an error worth retrying — it can
        // be traffic from another integration on the same Razorpay account.
        if (!purchase) break;
        const credited = await creditPurchaseOnce(
          purchase.id,
          purchase.userId,
          purchase.turns,
          payment?.id ?? purchase.razorpayPaymentId ?? 'webhook',
        );
        // Razorpay retries the same event, and sends both payment.captured and
        // order.paid for one payment, so landing here already-credited is the
        // normal case, not a fault.
        if (credited) {
          console.log(`Webhook credited ${purchase.turns} turns for order ${orderId}`);
        }
        break;
      }
      case 'payment.failed': {
        if (!orderId) break;
        const purchase = await findPurchaseByOrderId(orderId);
        if (purchase) await markPurchaseFailed(purchase.id);
        break;
      }
      default:
        // Subscribing to extra events in the dashboard shouldn't 4xx here.
        break;
    }

    // 2xx tells Razorpay the event is settled. Anything unexpected above throws
    // to the error handler's 500 instead, which is what makes it retry.
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

// The one place a paid order turns into turns. Both /payments/verify and the
// webhook route here; either can arrive first and both can arrive at once, so
// the claim is what decides who credits. A null return means someone else
// already did it.
async function creditPurchaseOnce(
  purchaseId: string,
  userId: string,
  turns: number,
  razorpayPaymentId: string,
) {
  const claimed = await claimPurchaseForCrediting(purchaseId, razorpayPaymentId);
  if (!claimed) return null;
  return creditTurns(userId, turns);
}
