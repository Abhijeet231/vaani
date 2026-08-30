import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { About } from './features/about/about';
import { Pricing } from './features/pricing/pricing';
import { Contact } from './features/contact/contact';
import { Login } from './features/auth/login/login';
import { OneToOne } from './features/one-to-one/one-to-one';
import { History } from './features/history/history';
import { Account } from './features/account/account';
import { Privacy } from './features/legal/privacy/privacy';
import { Terms } from './features/legal/terms/terms';
import { RefundPolicy } from './features/legal/refund-policy/refund-policy';
import { Waitlist } from './features/waitlist/waitlist';
import { authGuard, guestGuard } from './core/auth.guard';
import { waitlistGuard } from './core/waitlist.guard';

// waitlistGuard sits first on every route except /waitlist — when
// environment.waitlistOnly is on it redirects everything there; otherwise it's
// a pass-through and the route's own guards run as normal.
export const routes: Routes = [
  { path: '', component: Landing, data: { theme: 'graphite', hideChrome: true }, canActivate: [waitlistGuard] },
  { path: 'about', component: About, data: { theme: 'light' }, canActivate: [waitlistGuard] },
  { path: 'pricing', component: Pricing, data: { theme: 'lavender' }, canActivate: [waitlistGuard] },
  { path: 'contact', component: Contact, data: { theme: 'light' }, canActivate: [waitlistGuard] },
  { path: 'privacy', component: Privacy, data: { theme: 'light' }, canActivate: [waitlistGuard] },
  { path: 'terms', component: Terms, data: { theme: 'light' }, canActivate: [waitlistGuard] },
  { path: 'refund-policy', component: RefundPolicy, data: { theme: 'light' }, canActivate: [waitlistGuard] },
  // Always reachable by direct URL — harmless after launch, and it stays
  // previewable in dev where waitlistOnly is off.
  {
    path: 'waitlist',
    component: Waitlist,
    data: { theme: 'dark', hideChrome: true, hideFooter: true },
  },
  { path: 'login', component: Login, data: { theme: 'light' }, canActivate: [waitlistGuard, guestGuard] },
  { path: 'app', component: OneToOne, data: { theme: 'dark' }, canActivate: [waitlistGuard, authGuard] },
  { path: 'history', component: History, data: { theme: 'dark' }, canActivate: [waitlistGuard, authGuard] },
  { path: 'account', component: Account, data: { theme: 'dark' }, canActivate: [waitlistGuard, authGuard] },
];
