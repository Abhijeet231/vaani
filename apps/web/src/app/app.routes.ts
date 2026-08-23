import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { About } from './features/about/about';
import { Pricing } from './features/pricing/pricing';
import { Contact } from './features/contact/contact';
import { OneToOne } from './features/one-to-one/one-to-one';

export const routes: Routes = [
  { path: '', component: Landing, data: { theme: 'lavender' } },
  { path: 'about', component: About, data: { theme: 'light' } },
  { path: 'pricing', component: Pricing, data: { theme: 'light' } },
  { path: 'contact', component: Contact, data: { theme: 'light' } },
  { path: 'app', component: OneToOne, data: { theme: 'dark' } },
];
