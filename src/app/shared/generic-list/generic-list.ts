import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { GenericService } from '../../core/services/generic';
import { GenericFormDialog } from '../generic-form-dialog/generic-form-dialog';
import { ConfermaDialogComponent } from '../conferma-dialog/conferma-dialog';

export interface GenericListConfig {
  titolo: string;
  endpoint: string;
  campoTesto: string;
  labelCampo: string;
  iconaTitolo?: string;
}

@Component({
  selector: 'app-generic-list',
  standalone: true,
  imports: [ CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatTooltipModule, MatSnackBarModule ],
  templateUrl: './generic-list.html',
  styleUrl: './generic-list.scss'
})
export class GenericList implements OnInit {

  @Input() config!: GenericListConfig;

  lista = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  totale = signal<number>(0);
  paginaCorrente = signal<number>(0);
  elementiPerPagina = signal<number>(15);
  pagineTotali = computed(() => Math.ceil(this.totale() / this.elementiPerPagina()));

  // Ordinamento — una sola colonna ordinabile per le generic list
  ordinaPer = 'id';
  direzione: 'asc' | 'desc' = 'asc';

  colonneMostrate: string[] = ['id', 'valore', 'azioni'];

  constructor(private genericService: GenericService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() { this.caricaDati(1); }

  caricaDati(pagina: number) {
    this.isLoading.set(true);
    this.genericService.getAll(this.config.endpoint, pagina, this.direzione, this.ordinaPer).subscribe({
      next: (response) => {
        this.lista.set(response.dati.data);
        this.totale.set(response.dati.total);
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
    this.caricaDati(1);
}

getIconaOrdinamento(colonna: string): string {
    if (this.ordinaPer !== colonna) return 'unfold_more';
    return this.direzione === 'asc' ? 'arrow_upward' : 'arrow_downward';
}

  cambiaPagina(event: PageEvent) { this.caricaDati(event.pageIndex + 1); }

  saltaAPagina(inputElement: HTMLInputElement) {
    let p = parseInt(inputElement.value, 10);
    if (p < 1) { p = 1; inputElement.value = '1'; }
    else if (p > this.pagineTotali()) { p = this.pagineTotali(); inputElement.value = this.pagineTotali().toString(); }
    if (p !== this.paginaCorrente() + 1) this.caricaDati(p);
  }

  apriNuovo() {
    const dialogRef = this.dialog.open(GenericFormDialog, {
      width: '450px', maxWidth: '95vw', disableClose: true,
      data: { endpoint: this.config.endpoint, campoTesto: this.config.campoTesto, labelCampo: this.config.labelCampo }
    });
    dialogRef.afterClosed().subscribe(r => { if (r === true) { this.caricaDati(this.paginaCorrente() + 1); this.snackBar.open(`${this.config.titolo.slice(0, -1)} aggiunto!`, 'OK', { duration: 3000 }); } });
  }

  apriModifica(record: any) {
    const dialogRef = this.dialog.open(GenericFormDialog, {
      width: '450px', maxWidth: '95vw', disableClose: true,
      data: { endpoint: this.config.endpoint, campoTesto: this.config.campoTesto, labelCampo: this.config.labelCampo, record }
    });
    dialogRef.afterClosed().subscribe(r => { if (r === true) { this.caricaDati(this.paginaCorrente() + 1); this.snackBar.open(`${this.config.titolo.slice(0, -1)} modificato!`, 'OK', { duration: 3000 }); } });
  }

  apriConfermaEliminazione(record: any) {
    const nome = record[this.config.campoTesto];
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
      width: '420px',
      data: { titolo: 'Conferma eliminazione', messaggio: `Sei sicuro di voler eliminare ${nome ? '"' + nome + '"' : 'questo elemento'}?`, labelConferma: 'Elimina', labelAnnulla: 'Annulla' }
    });
    dialogRef.afterClosed().subscribe((confermato: boolean) => {
      if (confermato) {
        this.genericService.delete(this.config.endpoint, record.id).subscribe({
          next: () => {
            const p = this.lista().length === 1 && this.paginaCorrente() > 0 ? this.paginaCorrente() : this.paginaCorrente() + 1;
            this.caricaDati(p);
            this.snackBar.open('Elemento eliminato.', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Errore eliminazione.', 'Chiudi', { duration: 4000 })
        });
      }
    });
  }
}
