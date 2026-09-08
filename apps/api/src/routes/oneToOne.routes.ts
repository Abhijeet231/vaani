import { Router, raw } from 'express';
import { translateAudio, speakText } from '../controllers/oneToOne.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireUsageAvailable } from '../middleware/usage.middleware';
import { translationLimiter } from '../middleware/rate-limit.middleware';

export const oneToOneRouter = Router();

// translationLimiter sits after requireAuth (it keys on the Firebase uid) but
// before requireUsageAvailable and the body parser, so a flood is rejected
// before it costs a DB read or 25 MB of buffering.
oneToOneRouter.post(
  '/one-to-one/translate',
  requireAuth,
  translationLimiter,
  requireUsageAvailable,
  raw({ type: '*/*', limit: '25mb' }),
  translateAudio,
);
oneToOneRouter.post('/one-to-one/speak', requireAuth, translationLimiter, speakText);
