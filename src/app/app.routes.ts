import { Routes } from '@angular/router';
import { Guest } from './layout/guest/guest';
import { Dashboard } from './layout/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { Albi } from './pages/albi/albi';
import { AlboDettaglio } from './pages/albi/albo-dettaglio/albo-dettaglio';
import { Storie } from './pages/storie/storie/storie';
import { StoriaDettaglio } from './pages/storie/storia-dettaglio/storia-dettaglio';
import { Editori } from './pages/editori/editori';
import { Collane } from './pages/collane/collane';
import { Ruoli } from './pages/ruoli/ruoli';
import { Autori } from './pages/autori/autori';

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
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'albi', component: Albi },
      { path: 'albi/:id', component: AlboDettaglio },  // ← dettaglio albo
      { path: 'storie', component: Storie },
      { path: 'storie/:id', component: StoriaDettaglio },
      { path: 'editori', component: Editori },
      { path: 'collane', component: Collane },
      { path: 'ruoli', component: Ruoli },
      { path: 'autori', component: Autori },
    ]
  },

  // 3. FALLBACK
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
