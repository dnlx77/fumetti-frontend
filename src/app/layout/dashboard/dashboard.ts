import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterLinkActive, RouterLink } from '@angular/router'; // Dobbiamo importare RouterOutlet e Router
import { AuthService } from '../../core/services/auth'; // Il nostro maggiordomo!

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
      RouterOutlet,
      RouterLink,
      RouterLinkActive
  ], // Il "buco" per le pagine figlie
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  
  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  logout() {
    // Ci iscriviamo (subscribe) alla chiamata di logout
    this.authService.logout().subscribe({
      next: () => {
        console.log('Token distrutto sul server!');
        this.router.navigate(['/login']); // Torniamo al login
      },
      error: (err) => {
        console.error('Errore durante il logout', err);
        // Per sicurezza, se il server non risponde o il token era già scaduto,
        // puliamo comunque il browser e buttiamo fuori l'utente
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }
}