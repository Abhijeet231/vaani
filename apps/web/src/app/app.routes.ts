import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { Login } from './features/auth/login/login';
import { OneToOne } from './features/one-to-one/one-to-one';
import { Waitlist } from './features/waitlist/waitlist';
import { authGuard, guestGuard } from './core/auth.guard';
import { waitlistGuard } from './core/waitlist.guard';

// waitlistGuard sits first on every route except /waitlist — when
// environment.waitlistOnly is on it redirects everything there; otherwise it's
// a pass-through and the route's own guards run as normal.
//
// The critical-path screens (landing, waitlist, login, translate) load eagerly;
// everything else is lazy so it stays out of the initial bundle.
//
// There is no per-route `theme` any more — the whole app is one dark
// "Graphite & Jade" theme set on `html` in styles.scss (2026-09-08).
export const routes: Routes = [
  { path: '', component: Landing, data: { hideChrome: true }, canActivate: [waitlistGuard] },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    canActivate: [waitlistGuard],
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pricing').then((m) => m.Pricing),
    canActivate: [waitlistGuard],
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
    canActivate: [waitlistGuard],
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/privacy/privacy').then((m) => m.Privacy),
    canActivate: [waitlistGuard],
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms/terms').then((m) => m.Terms),
    canActivate: [waitlistGuard],
  },
  {
    path: 'refund-policy',
    loadComponent: () =>
      import('./features/legal/refund-policy/refund-policy').then((m) => m.RefundPolicy),
    canActivate: [waitlistGuard],
  },
  {
    path: 'shipping',
    loadComponent: () => import('./features/legal/shipping/shipping').then((m) => m.Shipping),
    canActivate: [waitlistGuard],
  },
  // Always reachable by direct URL — harmless after launch, and it stays
  // previewable in dev where waitlistOnly is off.
  {
    path: 'waitlist',
    component: Waitlist,
    data: { hideChrome: true, hideFooter: true },
  },
  { path: 'login', component: Login, canActivate: [waitlistGuard, guestGuard] },
  { path: 'app', component: OneToOne, canActivate: [waitlistGuard, authGuard] },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history').then((m) => m.History),
    canActivate: [waitlistGuard, authGuard],
  },
  {
    path: 'account',
    loadComponent: () => import('./features/account/account').then((m) => m.Account),
    canActivate: [waitlistGuard, authGuard],
  },
  // Catch-all. Keeps waitlistGuard first so a bad URL in waitlist-only mode
  // still lands on /waitlist rather than showing a 404 for a site that isn't
  // public yet.
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    canActivate: [waitlistGuard],
  },
];
