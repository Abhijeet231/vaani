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
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing, data: { theme: 'lavender', hideChrome: true } },
  { path: 'about', component: About, data: { theme: 'light' } },
  { path: 'pricing', component: Pricing, data: { theme: 'lavender' } },
  { path: 'contact', component: Contact, data: { theme: 'light' } },
  { path: 'privacy', component: Privacy, data: { theme: 'light' } },
  { path: 'terms', component: Terms, data: { theme: 'light' } },
  { path: 'refund-policy', component: RefundPolicy, data: { theme: 'light' } },
  { path: 'login', component: Login, data: { theme: 'light' }, canActivate: [guestGuard] },
  { path: 'app', component: OneToOne, data: { theme: 'dark' }, canActivate: [authGuard] },
  { path: 'history', component: History, data: { theme: 'dark' }, canActivate: [authGuard] },
  { path: 'account', component: Account, data: { theme: 'dark' }, canActivate: [authGuard] },
];
