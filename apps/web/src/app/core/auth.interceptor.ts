import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

// Every component calls the API with a relative `/api/...` path. In dev that
// stays relative (proxy.conf.json forwards it locally); in production, web
// and the API are deployed as two separate services, so this rewrites it to
// the real API origin — one place to change instead of every call site.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const url = environment.apiBaseUrl ? `${environment.apiBaseUrl}${req.url}` : req.url;

  return from(authService.getIdToken()).pipe(
    switchMap((token) =>
      next(req.clone({ url, ...(token ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}) }))
    )
  );
};
