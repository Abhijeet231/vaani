import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

// Pre-launch gate. When environment.waitlistOnly is true, every route it's
// attached to redirects to /waitlist — no exceptions, signed in or not.
// Attached to every route except /waitlist itself. A no-op when the flag is off.
export const waitlistGuard: CanActivateFn = () => {
  if (!environment.waitlistOnly) return true;
  return inject(Router).createUrlTree(['/waitlist']);
};
