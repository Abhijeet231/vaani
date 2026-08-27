import crypto from 'crypto';
import { env } from '../config/env';

// Razorpay's documented verification: HMAC-SHA256 of "order_id|payment_id"
// using the account's key secret must match the signature it returns after
// checkout. Never trust the frontend's "success" callback without this.
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!env.razorpayKeySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not set — add it to apps/api/.env');
  }

  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
