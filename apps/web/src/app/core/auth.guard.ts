import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

// Waits for Firebase's initial auth-state resolution (auth.ready) before
// deciding, so a page reload doesn't redirect to /login for a split second
// while Firebase is still figuring out if there's an existing session.
function afterReady<T>(project: () => T) {
  const auth = inject(AuthService);
  return toObservable(auth.ready).pipe(
    filter((ready) => ready),
    take(1),
    map(project)
  );
}

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return afterReady(() =>
    auth.user() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
  );
};

// Keeps an already-signed-in user off /login (redirects to /app instead).
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return afterReady(() => (auth.user() ? router.createUrlTree(['/app']) : true));
};
