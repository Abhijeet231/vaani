import { NextFunction, Request, Response } from 'express';
import { getRazorpay } from '../config/razorpay';
import { env } from '../config/env';
import { getPack, RECHARGE_PACKS } from '../config/pricing';
import { findOrCreateUser, creditTurns } from '../models/user.model';
import { createPurchase, findPurchaseByOrderId, markPurchasePaid } from '../models/purchase.model';
import { verifyRazorpaySignature } from '../services/payment.service';

export function listPacks(_req: Request, res: Response): void {
  res.json({ packs: RECHARGE_PACKS });
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

    // Idempotency: verify can be called more than once (retry, double-click) —
    // only credit turns the first time a given order is confirmed.
    if (purchase.status === 'paid') {
      res.status(200).json({ turnsBalance: user.turnsBalance });
      return;
    }

    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    await markPurchasePaid(purchase.id, razorpay_payment_id);
    const updated = await creditTurns(user.id, purchase.turns);

    res.status(200).json({ turnsBalance: updated?.turnsBalance ?? user.turnsBalance + purchase.turns });
  } catch (err) {
    next(err);
  }
}
