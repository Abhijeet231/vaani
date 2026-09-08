import { Router } from 'express';
import { getWaitlistCount, joinWaitlist } from '../controllers/waitlist.controller';
import { waitlistLimiter } from '../middleware/rate-limit.middleware';

export const waitlistRouter = Router();

// Public — no auth. These are the endpoints reachable while the site is in
// waitlist-only mode, which also makes the POST the easiest thing in the app
// to spam, hence the tight limiter.
waitlistRouter.post('/waitlist', waitlistLimiter, joinWaitlist);
waitlistRouter.get('/waitlist/count', getWaitlistCount);
