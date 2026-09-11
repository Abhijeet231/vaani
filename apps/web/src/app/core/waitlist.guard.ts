import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Pre-launch gate. When environment.waitlistOnly is true, every route it's
// attached to redirects to /waitlist — no exceptions, signed in or not.
// Attached to the product surfaces (/, /login, /app, /history, /account) — the
// marketing/legal pages (about, pricing, contact, privacy, terms, refund-policy,
// shipping) deliberately don't carry it, so they stay reachable pre-launch for
// things like a payment-provider KYC review. A no-op when the flag is off.
export const waitlistGuard: CanActivateFn = () => {
  if (!environment.waitlistOnly) return true;
  return inject(Router).createUrlTree(['/waitlist']);
};
