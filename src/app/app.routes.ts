import { Routes } from '@angular/router';
import { Guest } from './layout/guest/guest';
import { Dashboard } from './layout/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
  // 1. AREA PUBBLICA (Layout Guest)
  {
    path: 'login',
    component: Guest,
    // Qui in futuro metteremo il form di login come "figlio"
    children: [
        {path: '', component: Login},
        {path: 'register', component: Register}
    ]
  },

  // 2. AREA PRIVATA (Layout Dashboard)
  {
    path: '', // Se l'utente digita solo l'indirizzo base, entra nel gestionale
    component: Dashboard,
    children: [
      // Qui dentro, più avanti, inseriremo: /albi, /autori, /storie ecc...
    ]
  },

  // 3. ROTTA DI SALVATAGGIO (Fallback)
  // Se l'utente digita un URL inventato (es. /pippo), lo rimandiamo al gestionale (o al login)
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];