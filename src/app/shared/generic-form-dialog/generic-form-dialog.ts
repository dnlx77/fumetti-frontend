import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../core/services/generic';

export interface GenericFormDialogData {
  endpoint: string;   // es. 'editori'
  campoTesto: string; // es. 'nome' o 'descrizione'
  labelCampo: string; // es. 'Nome' o 'Descrizione'
  record?: any;       // se presente = modalità modifica
}

@Component({
  selector: 'app-generic-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isModifica ? 'Modifica' : 'Nuovo' }} {{ data.labelCampo }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ data.labelCampo }}</mat-label>
          <input matInput formControlName="valore" [placeholder]="'Inserisci ' + data.labelCampo">
          @if (form.get('valore')?.hasError('required') && form.get('valore')?.touched) {
            <mat-error>Il campo è obbligatorio</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="chiudi()">Annulla</button>
      <button mat-raised-button color="primary" (click)="salva()">
        {{ isModifica ? 'Salva Modifiche' : 'Salva' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { padding-top: 15px !important; }
    .form-container { padding: 5px 0; }
    .full-width { width: 100%; min-width: 350px; }
  `]
})
export class GenericFormDialog implements OnInit {

  form!: FormGroup;

  get isModifica(): boolean {
    return !!this.data.record;
  }

  constructor(
    private dialogRef: MatDialogRef<GenericFormDialog>,
    private fb: FormBuilder,
    private genericService: GenericService,
    @Inject(MAT_DIALOG_DATA) public data: GenericFormDialogData
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      // Precompiliamo con il valore esistente se siamo in modifica
      valore: [
        this.data.record ? this.data.record[this.data.campoTesto] : '',
        Validators.required
      ]
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

    // Costruiamo il payload con il nome del campo corretto
    // es. { nome: 'Bonelli' } oppure { descrizione: 'Testi' }
    const payload = {
      [this.data.campoTesto]: this.form.value.valore
    };

    if (this.isModifica) {
      this.genericService.update(this.data.endpoint, this.data.record.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Errore modifica:', err)
      });
    } else {
      this.genericService.create(this.data.endpoint, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Errore creazione:', err)
      });
    }
  }
}
