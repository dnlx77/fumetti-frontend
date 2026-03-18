import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { ProfiloService } from '../../core/services/profilo';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  menuAperto = false;
  nomeUtente = '';

  constructor(
    private authService: AuthService,
    private profiloService: ProfiloService,
    public router: Router
  ) {}

  ngOnInit() {
    // Carica il nome utente all'avvio
    this.profiloService.getProfilo().subscribe({
      next: (r) => { this.nomeUtente = r.dati.name; },
      error: () => { this.nomeUtente = ''; }
    });
  }

  toggleMenu() { this.menuAperto = !this.menuAperto; }
  chiudiMenu() { this.menuAperto = false; }

  logout() {
    this.authService.logout().subscribe({
      next: () => { this.router.navigate(['/login']); },
      error: () => {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }
}