import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { OneToOne } from './features/one-to-one/one-to-one';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'app', component: OneToOne },
];
