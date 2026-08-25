import { NextFunction, Request, Response } from 'express';
import { findOrCreateUser } from '../models/user.model';

export async function syncUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
