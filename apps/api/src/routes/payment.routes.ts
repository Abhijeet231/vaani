import { Router } from 'express';
import { createCheckout, listPacks, verifyCheckout } from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const paymentRouter = Router();

paymentRouter.get('/payments/packs', listPacks);
paymentRouter.post('/payments/checkout', requireAuth, createCheckout);
paymentRouter.post('/payments/verify', requireAuth, verifyCheckout);
