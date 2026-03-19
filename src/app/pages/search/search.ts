import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { SearchService } from '../../core/services/search';
import { AlboService } from '../../core/services/albo';
import { StoriaService } from '../../core/services/storia';
import { AutoreService } from '../../core/services/autore';
import { AlboFormDialog } from '../albi/albo-form-dialog/albo-form-dialog';
import { StoriaFormDialog } from '../storie/storia-form-dialog/storia-form-dialog';
import { AutoreFormDialog } from '../autori/autore-form-dialog/autore-form-dialog';
import { ConfermaDialogComponent } from '../../shared/conferma-dialog/conferma-dialog';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search implements OnInit, OnDestroy {

  q = '';
  tipo = 'contiene';

  campoAlbi = 'titolo';
  lettoAlbi = 'tutti';
  risultatiAlbi: any[] = [];
  totaleAlbi = 0;
  paginaAlbi = 0;
  perPaginaAlbi = 20;
  isLoadingAlbi = false;

  campoStorie = 'nome';
  lettoStorie = 'tutti';
  risultatiStorie: any[] = [];
  totaleStorie = 0;
  paginaStorie = 0;
  perPaginaStorie = 20;
  isLoadingStorie = false;

  campoAutori = 'cognome';
  risultatiAutori: any[] = [];
  totaleAutori = 0;
  paginaAutori = 0;
  perPaginaAutori = 20;
  isLoadingAutori = false;

  dalData = '';
  alData  = '';

  apiUrl = environment.apiUrl.replace('/api/v1', '');

  private searchSubject = new Subject<void>();
  private filtroSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  campiAlbi = [
    { value: 'titolo', label: 'Titolo' },
    { value: 'editore', label: 'Editore' },
    { value: 'collana', label: 'Collana' },
    { value: 'autore', label: 'Autore copertina' },
    { value: 'anno', label: 'Anno pubblicazione' },
    { value: 'barcode', label: 'Barcode' },
  ];

  campiStorie = [
    { value: 'nome', label: 'Nome' },
    { value: 'trama', label: 'Trama' },
    { value: 'autore', label: 'Autore' },
    { value: 'stato', label: 'Stato' },
  ];

  campiAutori = [
    { value: 'cognome', label: 'Cognome' },
    { value: 'nome', label: 'Nome' },
    { value: 'pseudonimo', label: 'Pseudonimo' },
    { value: 'tutti', label: 'Tutti i campi' },
  ];

  tipiRicerca = [
    { value: 'contiene', label: 'Contiene' },
    { value: 'inizia', label: 'Inizia per' },
    { value: 'esatta', label: 'Esatta' },
  ];

  statiStoria = [
    { value: 'in_corso', label: 'In Corso' },
    { value: 'autoconclusiva', label: 'Auto Conclusiva' },
    { value: 'finita', label: 'Finita' },
  ];

  constructor(
    private searchService: SearchService,
    private alboService: AlboService,
    private storiaService: StoriaService,
    private autoreService: AutoreService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.resetPagine();
      this.eseguiTutteRicerche();
    });

    this.filtroSubject.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.resetPagine();
      this.eseguiTutteRicerche();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput() { this.searchSubject.next(); }
  onFiltroChange() { this.filtroSubject.next(); }

  resetPagine() {
    this.paginaAlbi = 0;
    this.paginaStorie = 0;
    this.paginaAutori = 0;
  }

  eseguiTutteRicerche() {
    this.cercaAlbi(this.paginaAlbi);
    this.cercaStorie(this.paginaStorie);
    this.cercaAutori(this.paginaAutori);
  }

  cercaAlbi(pagina: number = 0) {
    this.isLoadingAlbi = true;
    this.searchService.cercaAlbi({
      q: this.q, campo: this.campoAlbi, tipo: this.tipo,
      letto: this.lettoAlbi, dal: this.dalData, al: this.alData, page: pagina + 1
    }).subscribe({
      next: (r) => {
        this.risultatiAlbi = r.dati.data;
        this.totaleAlbi = r.dati.total;
        this.perPaginaAlbi = r.dati.per_page;
        this.isLoadingAlbi = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingAlbi = false; this.cdr.detectChanges(); }
    });
  }

  cercaStorie(pagina: number = 0) {
    this.isLoadingStorie = true;
    this.searchService.cercaStorie({
      q: this.q, campo: this.campoStorie, tipo: this.tipo,
      letto: this.lettoStorie, page: pagina + 1
    }).subscribe({
      next: (r) => {
        this.risultatiStorie = r.dati.data;
        this.totaleStorie = r.dati.total;
        this.perPaginaStorie = r.dati.per_page;
        this.isLoadingStorie = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingStorie = false; this.cdr.detectChanges(); }
    });
  }

  cercaAutori(pagina: number = 0) {
    this.isLoadingAutori = true;
    this.searchService.cercaAutori({
      q: this.q, campo: this.campoAutori, tipo: this.tipo,
      page: pagina + 1
    }).subscribe({
      next: (r) => {
        this.risultatiAutori = r.dati.data;
        this.totaleAutori = r.dati.total;
        this.perPaginaAutori = r.dati.per_page;
        this.isLoadingAutori = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoadingAutori = false; this.cdr.detectChanges(); }
    });
  }

  // ================================
  // MODIFICA
  // ================================
  modificaAlbo(albo: any, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(AlboFormDialog, {
      width: '700px',
      maxWidth: '95vw',
      data: { albo }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.cercaAlbi(this.paginaAlbi);
    });
  }

  modificaStoria(storia: any, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(StoriaFormDialog, {
      width: '700px',
      maxWidth: '95vw',
      data: { storia }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.cercaStorie(this.paginaStorie);
    });
  }

  modificaAutore(autore: any, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(AutoreFormDialog, {
      width: '500px',
      maxWidth: '95vw',
      data: { autore }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.cercaAutori(this.paginaAutori);
    });
  }

  // ================================
  // ELIMINA
  // ================================
  eliminaAlbo(albo: any, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(ConfermaDialogComponent, {
      width: '400px',
      data: {
        titolo: 'Elimina albo',
        messaggio: `Sei sicuro di voler eliminare "${albo.titolo || 'questo albo'}"?`
      }
    });
    ref.afterClosed().subscribe(confermato => {
      if (!confermato) return;
      this.alboService.deleteAlbo(albo.id).subscribe({
        next: () => this.cercaAlbi(this.paginaAlbi),
        error: (err) => console.error('Errore eliminazione albo:', err)
      });
    });
  }

  eliminaStoria(storia: any, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(ConfermaDialogComponent, {
      width: '400px',
      data: {
        titolo: 'Elimina storia',
        messaggio: `Sei sicuro di voler eliminare "${storia.nome || 'questa storia'}"?`
      }
    });
    ref.afterClosed().subscribe(confermato => {
      if (!confermato) return;
      this.storiaService.deleteStoria(storia.id).subscribe({
        next: () => this.cercaStorie(this.paginaStorie),
        error: (err) => console.error('Errore eliminazione storia:', err)
      });
    });
  }

  eliminaAutore(autore: any, event: Event) {
    event.stopPropagation();
    const ref = this.dialog.open(ConfermaDialogComponent, {
      width: '400px',
      data: {
        titolo: 'Elimina autore',
        messaggio: `Sei sicuro di voler eliminare "${autore.cognome} ${autore.nome || ''}"?`
      }
    });
    ref.afterClosed().subscribe(confermato => {
      if (!confermato) return;
      this.autoreService.deleteAutore(autore.id).subscribe({
        next: () => this.cercaAutori(this.paginaAutori),
        error: (err) => console.error('Errore eliminazione autore:', err)
      });
    });
  }

  // ================================
  // PAGINAZIONE
  // ================================
  cambiaPaginaAlbi(event: PageEvent) {
    this.paginaAlbi = event.pageIndex;
    this.cercaAlbi(this.paginaAlbi);
  }

  cambiaPaginaStorie(event: PageEvent) {
    this.paginaStorie = event.pageIndex;
    this.cercaStorie(this.paginaStorie);
  }

  cambiaPaginaAutori(event: PageEvent) {
    this.paginaAutori = event.pageIndex;
    this.cercaAutori(this.paginaAutori);
  }

  getImmagineUrl(filename: string): string {
    return `${this.apiUrl}/storage/${filename}`;
  }

  etichettaStato(stato: string): string {
    const mappa: Record<string, string> = {
      'in_corso': 'In Corso',
      'autoconclusiva': 'Auto Conclusiva',
      'finita': 'Finita',
    };
    return mappa[stato] ?? stato;
  }

  get isAnno(): boolean { return this.campoAlbi === 'anno'; }
  get isStatoStoria(): boolean { return this.campoStorie === 'stato'; }
}