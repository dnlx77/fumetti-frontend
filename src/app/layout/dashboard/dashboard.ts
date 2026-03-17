import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

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
export class Dashboard {

  menuAperto = false;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  toggleMenu() {
    this.menuAperto = !this.menuAperto;
  }

  chiudiMenu() {
    this.menuAperto = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }
}
