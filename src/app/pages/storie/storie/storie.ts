import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { StoriaService } from '../../../core/services/storia';
import { Storia } from '../../../core/models/storia/storia';
import { StoriaFormDialog } from '../storia-form-dialog/storia-form-dialog';
import { ConfermaDialogComponent } from '../../../shared/conferma-dialog/conferma-dialog';
import { LettureDialog } from '../../../shared/letture-dialog/letture-dialog';

@Component({
  selector: 'app-storie',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatChipsModule, MatSnackBarModule, RouterModule,
  ],
  templateUrl: './storie.html',
  styleUrl: './storie.scss'
})
export class Storie implements OnInit {
  listaStorie = signal<Storia[]>([]);
  isLoading = signal<boolean>(true);

  totaleStorie = signal<number>(0);
  paginaCorrente = signal<number>(0);
  elementiPerPagina = signal<number>(15);
  pagineTotali = computed(() => Math.ceil(this.totaleStorie() / this.elementiPerPagina()));

  // Ordinamento
  ordinaPer = 'nome';
  direzione: 'asc' | 'desc' = 'asc';

  colonneMostrate: string[] = ['id', 'nome', 'stato', 'trama', 'letture', 'azioni'];

  constructor(
    private storiaService: StoriaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() { this.caricaStorie(1); }

  caricaStorie(pagina: number) {
    this.isLoading.set(true);
    this.storiaService.getStorie(pagina, this.ordinaPer, this.direzione).subscribe({
      next: (response) => {
        this.listaStorie.set(response.dati.data);
        this.totaleStorie.set(response.dati.total);
        this.paginaCorrente.set(response.dati.current_page - 1);
        if (response.dati.per_page) this.elementiPerPagina.set(response.dati.per_page);
        this.isLoading.set(false);
      },
      error: (err) => { console.error('Errore:', err); this.isLoading.set(false); }
    });
  }

  ordinaPerColonna(colonna: string) {
    if (this.ordinaPer === colonna) {
      this.direzione = this.direzione === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordinaPer = colonna;
      this.direzione = 'asc';
    }
    this.caricaStorie(1);
  }

  getIconaOrdinamento(colonna: string): string {
    if (this.ordinaPer !== colonna) return 'unfold_more';
    return this.direzione === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  cambiaPagina(event: PageEvent) { this.caricaStorie(event.pageIndex + 1); }

  saltaAPagina(inputElement: HTMLInputElement) {
    let p = parseInt(inputElement.value, 10);
    if (p < 1) { p = 1; inputElement.value = '1'; }
    else if (p > this.pagineTotali()) { p = this.pagineTotali(); inputElement.value = this.pagineTotali().toString(); }
    if (p !== this.paginaCorrente() + 1) this.caricaStorie(p);
  }

  apriNuovaStoria() {
    const dialogRef = this.dialog.open(StoriaFormDialog, { width: '700px', maxWidth: '95vw', disableClose: true, data: null });
    dialogRef.afterClosed().subscribe(r => {
      if (r === true) { this.caricaStorie(this.paginaCorrente() + 1); this.snackBar.open('Nuova storia aggiunta!', 'OK', { duration: 3000 }); }
    });
  }

  apriModifica(storia: Storia) {
    const dialogRef = this.dialog.open(StoriaFormDialog, { width: '700px', maxWidth: '95vw', disableClose: true, data: { storia } });
    dialogRef.afterClosed().subscribe(r => {
      if (r === true) { this.caricaStorie(this.paginaCorrente() + 1); this.snackBar.open('Storia modificata!', 'OK', { duration: 3000 }); }
    });
  }

  etichettaStato(stato: string): string {
    const mappa: Record<string, string> = { 'in_corso': 'In Corso', 'autoconclusiva': 'Auto Conclusiva', 'finita': 'Finita' };
    return mappa[stato] ?? stato;
  }

  apriConfermaEliminazione(storia: Storia) {
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
      width: '420px',
      data: { titolo: 'Conferma eliminazione', messaggio: `Sei sicuro di voler eliminare "${storia.nome}"?`, labelConferma: 'Elimina', labelAnnulla: 'Annulla' }
    });
    dialogRef.afterClosed().subscribe((confermato: boolean) => {
      if (confermato) {
        this.storiaService.deleteStoria(storia.id).subscribe({
          next: () => {
            const p = this.listaStorie().length === 1 && this.paginaCorrente() > 0 ? this.paginaCorrente() : this.paginaCorrente() + 1;
            this.caricaStorie(p);
            this.snackBar.open('Storia eliminata.', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Errore eliminazione.', 'Chiudi', { duration: 4000 })
        });
      }
    });
  }

  apriLetture(storia: any): void {
    const dialogRef = this.dialog.open(LettureDialog, {
      width: '450px', maxWidth: '95vw',
      data: { tipo: 'storia', id: storia.id, titolo: storia.nome || `Storia #${storia.id}` }
    });
    dialogRef.afterClosed().subscribe(() => this.caricaStorie(this.paginaCorrente() + 1));
  }
}
