import { Router } from 'express';
import { joinWaitlist } from '../controllers/waitlist.controller';

export const waitlistRouter = Router();

// Public — no auth. This is the one endpoint reachable while the site is in
// waitlist-only mode.
waitlistRouter.post('/waitlist', joinWaitlist);
