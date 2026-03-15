import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { AlboService } from '../../core/services/albo';
import { Albo } from '../../core/models/albo';
import { environment } from '../../../environments/environment';
import { AlboFormDialog } from './albo-form-dialog/albo-form-dialog';
import { ConfermaDialogComponent } from '../../shared/conferma-dialog/conferma-dialog';
import { LettureDialog } from '../../shared/letture-dialog/letture-dialog';

@Component({
  selector: 'app-albi',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterModule,
    LettureDialog,
  ],
  templateUrl: './albi.html',
  styleUrl: './albi.scss'
})
export class Albi implements OnInit {
  listaAlbi = signal<Albo[]>([]);
  isLoading = signal<boolean>(true);

  totaleAlbi = signal<number>(0);
  paginaCorrente = signal<number>(0);
  elementiPerPagina = signal<number>(50);
  pagineTotali = computed(() => Math.ceil(this.totaleAlbi() / this.elementiPerPagina()));

  apiUrl = environment.apiUrl.replace('/api/v1', '');

  // Aggiunta la colonna 'azioni' in fondo
  colonneMostrate: string[] = ['copertina', 'id', 'titolo', 'numero', 'collana', 'editore', 'data_pubblicazione', 'letture', 'azioni'];

  constructor(
    private alboService: AlboService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  getImmagineUrl(filename: string): string {
    return `${this.apiUrl}/storage/${filename}`;
  }

  ngOnInit() {
    this.caricaFumetti(1);
  }

  caricaFumetti(pagina: number) {
    this.isLoading.set(true);
    this.alboService.getAlbi(pagina).subscribe({
      next: (response) => {
        this.listaAlbi.set(response.dati.data);
        this.totaleAlbi.set(response.dati.total);
        this.paginaCorrente.set(response.dati.current_page - 1);
        if (response.dati.per_page) {
          this.elementiPerPagina.set(response.dati.per_page);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore API:', err);
        this.isLoading.set(false);
      }
    });
  }

  cambiaPagina(event: PageEvent) {
    const paginaRichiesta = event.pageIndex + 1;
    this.caricaFumetti(paginaRichiesta);
  }

  saltaAPagina(inputElement: HTMLInputElement) {
    let paginaScelta = parseInt(inputElement.value, 10);
    if (paginaScelta < 1) {
      paginaScelta = 1;
      inputElement.value = '1';
    } else if (paginaScelta > this.pagineTotali()) {
      paginaScelta = this.pagineTotali();
      inputElement.value = this.pagineTotali().toString();
    }
    if (paginaScelta !== (this.paginaCorrente() + 1)) {
      this.caricaFumetti(paginaScelta);
    }
  }

  // ✏️ Apre il dialog di MODIFICA passando l'albo selezionato come dato
  apriModifica(albo: Albo): void {
    const dialogRef = this.dialog.open(AlboFormDialog, {
      width: '700px',
      disableClose: true, // L'utente deve usare Annulla, non cliccare fuori
      data: { albo }      // Questo è il dato che il dialog riceve via MAT_DIALOG_DATA
    });

    dialogRef.afterClosed().subscribe(risultato => {
      if (risultato === true) {
        // Il dialog ha chiuso con successo → ricarichiamo la pagina corrente
        this.caricaFumetti(this.paginaCorrente() + 1);
        this.snackBar.open('Albo modificato con successo!', 'OK', { duration: 3000 });
      }
    });
  }

  // 🗑️ Apre il dialog di CONFERMA, poi chiama l'API di eliminazione
  apriConfermaEliminazione(albo: Albo): void {
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
      width: '420px',
      data: {
        titolo: 'Conferma eliminazione',
        messaggio: `Sei sicuro di voler eliminare ${albo.titolo ? '"' + albo.titolo + '"' : 'questo albo'}? L'operazione è irreversibile.`,
        labelConferma: 'Elimina',
        labelAnnulla: 'Annulla'
      }
    });

    dialogRef.afterClosed().subscribe((confermato: boolean) => {
      if (confermato) {
        this.alboService.deleteAlbo(albo.id).subscribe({
          next: () => {
            // Se eravamo all'ultima pagina e l'abbiamo svuotata, torniamo alla precedente
            const paginaDaCaricare = this.listaAlbi().length === 1 && this.paginaCorrente() > 0
              ? this.paginaCorrente()       // torna alla pagina precedente (indice - 1 + 1 = indice)
              : this.paginaCorrente() + 1;  // ricarica la pagina corrente (indice + 1 = numero pagina)
            this.caricaFumetti(paginaDaCaricare);
            this.snackBar.open('Albo eliminato.', 'OK', { duration: 3000 });
          },
          error: (err) => {
            console.error('Errore eliminazione:', err);
            this.snackBar.open('Errore durante l\'eliminazione.', 'Chiudi', { duration: 4000 });
          }
        });
      }
    });
  }

  // Apre il dialog di CREAZIONE (senza dati = MAT_DIALOG_DATA è null)
  apriNuovoAlbo(): void {
    const dialogRef = this.dialog.open(AlboFormDialog, {
      width: '700px',
      disableClose: true,
      data: null // Nessun albo passato = modalità crea
    });

    dialogRef.afterClosed().subscribe(risultato => {
      if (risultato === true) {
        this.caricaFumetti(this.paginaCorrente() + 1);
        this.snackBar.open('Nuovo albo aggiunto!', 'OK', { duration: 3000 });
      }
    });
  }

  apriLetture(albo: any): void {
    const dialogRef = this.dialog.open(LettureDialog, {
        width: '450px',
        data: {
            tipo: 'albo',
            id: albo.id,
            titolo: albo.titolo || `Albo #${albo.id}`
        }
    });
 
    // Quando il dialog si chiude ricarichiamo per aggiornare il conteggio
    dialogRef.afterClosed().subscribe(() => {
        this.caricaFumetti(this.paginaCorrente() + 1);
    });
}
}