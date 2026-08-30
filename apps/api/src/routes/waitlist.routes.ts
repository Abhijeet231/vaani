import { Router } from 'express';
import { getWaitlistCount, joinWaitlist } from '../controllers/waitlist.controller';

export const waitlistRouter = Router();

// Public — no auth. These are the endpoints reachable while the site is in
// waitlist-only mode.
waitlistRouter.post('/waitlist', joinWaitlist);
waitlistRouter.get('/waitlist/count', getWaitlistCount);
