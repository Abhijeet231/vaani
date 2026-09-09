import { Router } from 'express';
import {
  createCheckout,
  handleRazorpayWebhook,
  listPacks,
  listPurchases,
  verifyCheckout,
} from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const paymentRouter = Router();

paymentRouter.get('/payments/packs', listPacks);
paymentRouter.get('/payments/purchases', requireAuth, listPurchases);
paymentRouter.post('/payments/checkout', requireAuth, createCheckout);
paymentRouter.post('/payments/verify', requireAuth, verifyCheckout);
// No requireAuth: the caller is Razorpay, not a browser with a Firebase token.
// The HMAC signature over the raw body is the authentication — see the handler.
// app.ts mounts express.raw on this path so that body survives to be checked.
paymentRouter.post('/payments/webhook', handleRazorpayWebhook);
