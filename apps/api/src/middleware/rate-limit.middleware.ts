import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

// Three limiters, protecting three different things. The in-memory store is
// fine while the API runs as a single Render instance; scaling out would need
// a shared (Redis) store or each instance would enforce its own separate
// allowance.

// Blanket per-IP ceiling for everything under /api. Deliberately loose — it's
// a flood guard, not a usage policy.
export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

// POST /api/waitlist is fully public with no auth, so it's the easiest thing
// in the app to abuse — junk signups would poison the one real pre-launch
// metric there is. Much tighter than the global limit.
export const waitlistLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many signups from this network. Please try again later.' },
});

// Per-authenticated-user, on the routes that actually spend money at Sarvam.
// Keyed on the Firebase uid rather than the IP so that a shared network (an
// office, a college, a CGNAT carrier) doesn't rate limit unrelated people
// against each other. Must be mounted after requireAuth or req.user is unset.
export const translationLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // The IP fallback only applies if this is ever mounted without requireAuth.
  // It has to go through ipKeyGenerator: a raw req.ip gives every address in an
  // IPv6 /64 its own bucket, and one client is routinely handed a whole /64, so
  // the limit would be trivially sidestepped by rotating the low bits.
  keyGenerator: (req: Request) => req.user?.uid ?? ipKeyGenerator(req.ip ?? 'unknown'),
  message: { error: 'Too many translations in a row. Give it a moment.' },
});
