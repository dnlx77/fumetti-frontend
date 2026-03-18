import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProfiloService } from '../../core/services/profilo';

@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './profilo.html',
  styleUrl: './profilo.scss'
})
export class Profilo implements OnInit {

  utente: { name: string; email: string } | null = null;
  isLoading = true;

  form!: FormGroup;
  isSaving = false;
  errorePassword: string | null = null;

  // Mostra/nascondi password
  mostraAttuale = false;
  mostraNuova = false;
  mostraConferma = false;

  constructor(
    private profiloService: ProfiloService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      password_attuale: ['', Validators.required],
      nuova_password:   ['', [Validators.required, Validators.minLength(8)]],
      conferma:         ['', Validators.required],
    }, { validators: this.passwordMatch });

    this.profiloService.getProfilo().subscribe({
      next: (r) => {
        this.utente = r.dati;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  passwordMatch(group: FormGroup) {
    const nuova   = group.get('nuova_password')?.value;
    const conferma = group.get('conferma')?.value;
    return nuova === conferma ? null : { passwordMismatch: true };
  }

  salvaPassword() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorePassword = null;

    this.profiloService.cambiaPassword({
      password_attuale: this.form.value.password_attuale,
      nuova_password:   this.form.value.nuova_password,
      nuova_password_confirmation: this.form.value.conferma,
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.form.reset();
        this.snackBar.open('✅ Password aggiornata con successo!', 'Chiudi', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        if (err.status === 422) {
          const errors = err.error?.errors;
          if (errors?.password_attuale) {
            this.errorePassword = errors.password_attuale[0];
          } else {
            this.errorePassword = 'Errore nella validazione. Controlla i campi.';
          }
        } else {
          this.errorePassword = 'Errore durante il salvataggio. Riprova.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
