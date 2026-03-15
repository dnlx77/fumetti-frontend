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

import { AutoreService } from '../../core/services/autore';
import { Autore } from '../../core/models/autore';
import { AutoreFormDialog } from './autore-form-dialog/autore-form-dialog';
import { ConfermaDialogComponent } from '../../shared/conferma-dialog/conferma-dialog';

@Component({
  selector: 'app-autori',
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
  ],
  templateUrl: './autori.html',
  styleUrl: './autori.scss'
})
export class Autori implements OnInit {

  listaAutori = signal<Autore[]>([]);
  isLoading = signal<boolean>(true);

  totale = signal<number>(0);
  paginaCorrente = signal<number>(0);
  elementiPerPagina = signal<number>(15);
  pagineTotali = computed(() => Math.ceil(this.totale() / this.elementiPerPagina()));

  colonneMostrate: string[] = ['id', 'cognome', 'nome', 'pseudonimo', 'azioni'];

  constructor(
    private autoreService: AutoreService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.caricaAutori(1);
  }

  caricaAutori(pagina: number) {
    this.isLoading.set(true);
    this.autoreService.getAutori(pagina).subscribe({
      next: (response) => {
        this.listaAutori.set(response.dati.data);
        this.totale.set(response.dati.total);
        this.paginaCorrente.set(response.dati.current_page - 1);
        if (response.dati.per_page) {
          this.elementiPerPagina.set(response.dati.per_page);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento autori:', err);
        this.isLoading.set(false);
      }
    });
  }

  cambiaPagina(event: PageEvent) {
    this.caricaAutori(event.pageIndex + 1);
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
    if (paginaScelta !== this.paginaCorrente() + 1) {
      this.caricaAutori(paginaScelta);
    }
  }

  // ➕ Nuovo autore
  apriNuovo() {
    const dialogRef = this.dialog.open(AutoreFormDialog, {
      width: '550px',
      disableClose: true,
      data: null
    });
    dialogRef.afterClosed().subscribe(risultato => {
      if (risultato === true) {
        this.caricaAutori(this.paginaCorrente() + 1);
        this.snackBar.open('Autore aggiunto!', 'OK', { duration: 3000 });
      }
    });
  }

  // ✏️ Modifica autore
  apriModifica(autore: Autore) {
    const dialogRef = this.dialog.open(AutoreFormDialog, {
      width: '550px',
      disableClose: true,
      data: { autore }
    });
    dialogRef.afterClosed().subscribe(risultato => {
      if (risultato === true) {
        this.caricaAutori(this.paginaCorrente() + 1);
        this.snackBar.open('Autore modificato!', 'OK', { duration: 3000 });
      }
    });
  }

  // 🗑️ Elimina autore
  apriConfermaEliminazione(autore: Autore) {
    const nome = [autore.cognome, autore.nome].filter(Boolean).join(' ');
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
      width: '420px',
      data: {
        titolo: 'Conferma eliminazione',
        messaggio: `Sei sicuro di voler eliminare "${nome}"? L'operazione è irreversibile.`,
        labelConferma: 'Elimina',
        labelAnnulla: 'Annulla'
      }
    });
    dialogRef.afterClosed().subscribe((confermato: boolean) => {
      if (confermato) {
        this.autoreService.deleteAutore(autore.id).subscribe({
          next: () => {
            const paginaDaCaricare = this.listaAutori().length === 1 && this.paginaCorrente() > 0
              ? this.paginaCorrente()
              : this.paginaCorrente() + 1;
            this.caricaAutori(paginaDaCaricare);
            this.snackBar.open('Autore eliminato.', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Errore durante l\'eliminazione.', 'Chiudi', { duration: 4000 })
        });
      }
    });
  }
}
