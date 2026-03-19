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

  // Ordinamento
  ordinaPer = 'data_pubblicazione';
  direzione: 'asc' | 'desc' = 'desc';

  apiUrl = environment.apiUrl.replace('/api/v1', '');

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
    this.alboService.getAlbi(pagina, this.ordinaPer, this.direzione).subscribe({
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

  ordinaPerColonna(colonna: string) {
    if (this.ordinaPer === colonna) {
      this.direzione = this.direzione === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordinaPer = colonna;
      this.direzione = 'asc';
    }
    this.caricaFumetti(1);
  }

  getIconaOrdinamento(colonna: string): string {
    if (this.ordinaPer !== colonna) return 'unfold_more';
    return this.direzione === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  cambiaPagina(event: PageEvent) {
    this.caricaFumetti(event.pageIndex + 1);
  }

  saltaAPagina(inputElement: HTMLInputElement) {
    let paginaScelta = parseInt(inputElement.value, 10);
    if (paginaScelta < 1) { paginaScelta = 1; inputElement.value = '1'; }
    else if (paginaScelta > this.pagineTotali()) { paginaScelta = this.pagineTotali(); inputElement.value = this.pagineTotali().toString(); }
    if (paginaScelta !== (this.paginaCorrente() + 1)) this.caricaFumetti(paginaScelta);
  }

  apriModifica(albo: Albo): void {
    const dialogRef = this.dialog.open(AlboFormDialog, {
      width: '700px', maxWidth: '95vw', disableClose: true, data: { albo }
    });
    dialogRef.afterClosed().subscribe(risultato => {
      if (risultato === true) {
        this.caricaFumetti(this.paginaCorrente() + 1);
        this.snackBar.open('Albo modificato con successo!', 'OK', { duration: 3000 });
      }
    });
  }

  apriConfermaEliminazione(albo: Albo): void {
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
      width: '420px',
      data: {
        titolo: 'Conferma eliminazione',
        messaggio: `Sei sicuro di voler eliminare ${albo.titolo ? '"' + albo.titolo + '"' : 'questo albo'}? L'operazione è irreversibile.`,
        labelConferma: 'Elimina', labelAnnulla: 'Annulla'
      }
    });
    dialogRef.afterClosed().subscribe((confermato: boolean) => {
      if (confermato) {
        this.alboService.deleteAlbo(albo.id).subscribe({
          next: () => {
            const p = this.listaAlbi().length === 1 && this.paginaCorrente() > 0
              ? this.paginaCorrente() : this.paginaCorrente() + 1;
            this.caricaFumetti(p);
            this.snackBar.open('Albo eliminato.', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Errore durante l\'eliminazione.', 'Chiudi', { duration: 4000 })
        });
      }
    });
  }

  apriNuovoAlbo(): void {
    const dialogRef = this.dialog.open(AlboFormDialog, {
      width: '700px', maxWidth: '95vw', disableClose: true, data: null
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
      width: '450px', maxWidth: '95vw',
      data: { tipo: 'albo', id: albo.id, titolo: albo.titolo || `Albo #${albo.id}` }
    });
    dialogRef.afterClosed().subscribe(() => this.caricaFumetti(this.paginaCorrente() + 1));
  }
}
