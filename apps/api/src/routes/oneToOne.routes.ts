import { Router, raw } from 'express';
import { translateAudio, speakText } from '../controllers/oneToOne.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const oneToOneRouter = Router();

oneToOneRouter.post(
  '/one-to-one/translate',
  requireAuth,
  raw({ type: '*/*', limit: '25mb' }),
  translateAudio,
);
oneToOneRouter.post('/one-to-one/speak', requireAuth, speakText);
