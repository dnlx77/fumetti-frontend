import { Routes } from '@angular/router';
import { Guest } from './layout/guest/guest';
import { Dashboard } from './layout/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Albi } from './pages/albi/albi';
import { Storie } from './pages/storie/storie/storie';

export const routes: Routes = [
  // 1. AREA PUBBLICA
  {
    path: 'login',
    component: Guest,
    children: [
      { path: '', component: Login },
      { path: 'register', component: Register }
    ]
  },

  // 2. AREA PRIVATA
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'albi', pathMatch: 'full' },
      { path: 'albi', component: Albi },
      { path: 'storie', component: Storie },  // ← nuova rotta
    ]
  },

  // 3. FALLBACK
  { path: '**', redirectTo: '', pathMatch: 'full' }
];