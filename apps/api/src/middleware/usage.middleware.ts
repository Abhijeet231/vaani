import { NextFunction, Request, Response } from 'express';
import { findOrCreateUser } from '../models/user.model';
import { TRIAL_TURN_LIMIT } from '../config/limits';

// Runs after requireAuth. Loads the caller's row (attached as req.dbUser so
// the controller doesn't have to look it up again) and blocks trial users
// who've used their free turns — before we spend anything on a Sarvam call.
export async function requireUsageAvailable(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await findOrCreateUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name,
    });

    if (user.plan === 'trial' && user.usageCount >= TRIAL_TURN_LIMIT) {
      res.status(403).json({
        error: 'trial_limit_reached',
        used: user.usageCount,
        limit: TRIAL_TURN_LIMIT,
      });
      return;
    }

    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
}
