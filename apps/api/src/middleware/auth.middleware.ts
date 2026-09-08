import { NextFunction, Request, Response } from 'express';
import { getFirebaseAuth } from '../config/firebase-admin';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const decoded = await getFirebaseAuth().verifyIdToken(token);

    // vaani signs people in with Google only, which always reports a verified
    // address — so in normal use this never trips. It's here because removing
    // the email/password form from the UI doesn't disable the provider in the
    // Firebase project: anyone can still create an unverified account straight
    // against Firebase's REST API and get a valid token. Each fresh account is
    // worth FREE_TRIAL_TURNS of Sarvam calls on our bill, so the check belongs
    // on the server, where it can't be skipped.
    if (!decoded.email_verified) {
      res.status(403).json({ error: 'email_not_verified' });
      return;
    }

    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    next(err);
  }
}
