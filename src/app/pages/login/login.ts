import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  // Diciamo ad Angular quali "pezzi" usare in questa schermata
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;

  // Il FormBuilder ci aiuta a costruire il form velocemente
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Questa funzione scatta quando premiamo "Entra"
  onSubmit() {
    if (this.loginForm.valid) {
      // Passiamo i dati del form al nostro servizio
      this.authService.login(this.loginForm.value).subscribe({
        
        next: (risposta) => {
          console.log('Login riuscito! Token ricevuto:', risposta);
          // Se va tutto bene, teletrasportiamo l'utente nella Dashboard!
          this.router.navigate(['/dashboard']); 
        },
        
        error: (errore) => {
          console.error('Errore durante il login:', errore);
          alert('Credenziali errate o server spento!'); // Per ora un semplice alert
        }
        
      });
    }
  }
}