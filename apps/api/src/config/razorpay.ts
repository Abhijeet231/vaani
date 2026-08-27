import Razorpay from 'razorpay';
import { env } from './env';

let client: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!client) {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
      throw new Error(
        'Razorpay credentials are not set — add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET to apps/api/.env'
      );
    }
    client = new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
  }
  return client;
}
