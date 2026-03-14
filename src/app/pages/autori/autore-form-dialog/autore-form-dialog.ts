import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AutoreService } from '../../../core/services/autore';
import { Autore } from '../../../core/models/autore';

export interface AutoreDialogData {
  autore?: Autore;
}

@Component({
  selector: 'app-autore-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './autore-form-dialog.html',
  styleUrl: './autore-form-dialog.scss'
})
export class AutoreFormDialog implements OnInit {

  form!: FormGroup;

  get isModifica(): boolean {
    return !!this.data?.autore;
  }

  constructor(
    private dialogRef: MatDialogRef<AutoreFormDialog>,
    private fb: FormBuilder,
    private autoreService: AutoreService,
    @Inject(MAT_DIALOG_DATA) public data: AutoreDialogData | null
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      cognome:    [this.data?.autore?.cognome    ?? '', Validators.required],
      nome:       [this.data?.autore?.nome       ?? ''],
      pseudonimo: [this.data?.autore?.pseudonimo ?? ''],
    });
  }

  chiudi() {
    this.dialogRef.close(false);
  }

  salva() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      cognome:    this.form.value.cognome,
      nome:       this.form.value.nome       || null,
      pseudonimo: this.form.value.pseudonimo || null,
    };

    if (this.isModifica) {
      this.autoreService.updateAutore(this.data!.autore!.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Errore modifica autore:', err)
      });
    } else {
      this.autoreService.creaAutore(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Errore creazione autore:', err)
      });
    }
  }
}
