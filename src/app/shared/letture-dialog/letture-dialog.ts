import { Component, OnInit, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LetturaService, Lettura } from '../../core/services/lettura';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfermaDialogComponent } from '../conferma-dialog/conferma-dialog';

export interface LettureDialogData {
  tipo: 'albo' | 'storia';  // distingue albo da storia
  id: number;               // id dell'albo o della storia
  titolo: string;           // titolo da mostrare nell'header del dialog
}

@Component({
  selector: 'app-letture-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './letture-dialog.html',
  styleUrl: './letture-dialog.scss'
})
export class LettureDialog implements OnInit {

  letture = signal<Lettura[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  // Campo data con default oggi
  dataCtrl = new FormControl(
    new Date().toISOString().split('T')[0], // formato YYYY-MM-DD
    Validators.required
  );

  constructor(
    private dialogRef: MatDialogRef<LettureDialog>,
    private letturaService: LetturaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: LettureDialogData
  ) {}

  ngOnInit() {
    this.caricaLetture();
  }

  caricaLetture() {
    this.isLoading.set(true);
    const chiamata = this.data.tipo === 'albo'
      ? this.letturaService.getLettureAlbo(this.data.id)
      : this.letturaService.getLettureStoria(this.data.id);

    chiamata.subscribe({
      next: (response) => {
        this.letture.set(response.dati);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento letture:', err);
        this.isLoading.set(false);
      }
    });
  }

  aggiungiLettura() {
    if (this.dataCtrl.invalid || this.isSaving()) return;

    const data = this.dataCtrl.value!;

    // Controllo frontend — data già presente?
    const dataGiaPresente = this.letture().some(l => l.data_lettura === data);
    if (dataGiaPresente) {
        this.snackBar.open('Hai già registrato una lettura per questa data.', 'OK', { duration: 3000 });
        return;
    }

    this.isSaving.set(true);
    const chiamata = this.data.tipo === 'albo'
      ? this.letturaService.addLetturaAlbo(this.data.id, data)
      : this.letturaService.addLetturaStoria(this.data.id, data);

    chiamata.subscribe({
      next: () => {
        this.caricaLetture();
        // Reset data a oggi dopo il salvataggio
        this.dataCtrl.setValue(new Date().toISOString().split('T')[0]);
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Errore aggiunta lettura:', err);
        this.isSaving.set(false);
      }
    });
  }

  eliminaLettura(lettura: Lettura) {
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
        width: '380px',
        data: {
            titolo: 'Conferma eliminazione',
            messaggio: `Sei sicuro di voler eliminare la lettura del ${new Date(lettura.data_lettura).toLocaleDateString('it-IT')}?`,
            labelConferma: 'Elimina',
            labelAnnulla: 'Annulla'
        }
    });

    dialogRef.afterClosed().subscribe((confermato: boolean) => {
        if (confermato) {
            const chiamata = this.data.tipo === 'albo'
                ? this.letturaService.deleteLetturaAlbo(this.data.id, lettura.data_lettura)
                : this.letturaService.deleteLetturaStoria(this.data.id, lettura.data_lettura);

            chiamata.subscribe({
                next: () => this.caricaLetture(),
                error: (err) => console.error('Errore eliminazione lettura:', err)
            });
        }
    });
  }

  chiudi() {
    // Passiamo true al padre solo se sono state fatte modifiche
    // così il padre sa se ricaricare il conteggio
    this.dialogRef.close(true);
  }
}
