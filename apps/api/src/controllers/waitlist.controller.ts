import { NextFunction, Request, Response } from 'express';
import { countWaitlistSignups, createWaitlistSignup } from '../models/waitlist.model';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose E.164-ish: optional leading +, then 7–15 digits.
const PHONE_RE = /^\+?[0-9]{7,15}$/;

export async function joinWaitlist(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>;

  // Honeypot: a hidden field real users never see. If it's filled, silently
  // accept without storing anything.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    res.status(200).json({ ok: true });
    return;
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone.replace(/[\s()-]/g, '') : '';

  if (!email && !phone) {
    res.status(400).json({ error: 'Enter an email address or a phone number.' });
    return;
  }
  if (email && !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'That email address looks invalid.' });
    return;
  }
  if (phone && !PHONE_RE.test(phone)) {
    res.status(400).json({ error: 'That phone number looks invalid.' });
    return;
  }

  try {
    const { total } = await createWaitlistSignup({ email: email || null, phone: phone || null });
    // Same response for a fresh signup and a duplicate — no way to probe who's
    // already on the list. `position` is the current list size.
    res.status(200).json({ ok: true, position: total });
  } catch (err) {
    next(err);
  }
}

export async function getWaitlistCount(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json({ count: await countWaitlistSignups() });
  } catch (err) {
    next(err);
  }
}
