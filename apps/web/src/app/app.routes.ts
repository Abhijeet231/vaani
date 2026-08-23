import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { OneToOne } from './features/one-to-one/one-to-one';

export const routes: Routes = [
  { path: '', component: Landing, data: { theme: 'light' } },
  { path: 'app', component: OneToOne, data: { theme: 'dark' } },
];
