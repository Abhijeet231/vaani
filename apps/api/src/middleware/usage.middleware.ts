import { NextFunction, Request, Response } from 'express';
import { findOrCreateUser } from '../models/user.model';

// Runs after requireAuth. Loads the caller's row (attached as req.dbUser so
// the controller doesn't have to look it up again) and blocks anyone with no
// turns left — before we spend anything on a Sarvam call. Applies the same
// way to trial and paid users: it's all one balance, topped up by packs.
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

    if (user.turnsBalance <= 0) {
      res.status(403).json({ error: 'no_turns_left', balance: user.turnsBalance });
      return;
    }

    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
}
