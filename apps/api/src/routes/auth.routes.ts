import { Router } from 'express';
import { syncUser } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/auth/sync', requireAuth, syncUser);
