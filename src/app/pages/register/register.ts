import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router, RouterLink } from '@angular/router'; // Aggiunto RouterLink per il pulsante "Torna indietro"
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    RouterLink // Necessario per il link verso il login
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required] // Campo per la conferma
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // Controllo rapido: le due password coincidono?
      if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
        alert('Le password non coincidono!');
        return;
      }

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          console.log('Registrazione completata!');
          this.router.navigate(['/dashboard']); 
        },
        error: (errore) => {
          console.error('Errore di registrazione:', errore);
          alert('Errore! Forse questa email è già registrata?');
        }
      });
    }
  }
}