import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { StoriaService } from '../../../core/services/storia';
import { environment } from '../../../../environments/environment';
import { LettureDialog } from '../../../shared/letture-dialog/letture-dialog';

@Component({
  selector: 'app-storia-dettaglio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './storia-dettaglio.html',
  styleUrl: './storia-dettaglio.scss'
})
export class StoriaDettaglio implements OnInit {

  private _storiaData: any = null;
  isLoading = signal<boolean>(true);
  datiPronti = false;
  readonly ALBI_PER_PAGINA = 5;
  paginaAlbi = 0;

  apiUrl = environment.apiUrl.replace('/api/v1', '');

  get storia(): any {
    return this._storiaData;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storiaService: StoriaService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.storiaService.getStoria(id).subscribe({
      next: (response) => {
        this._storiaData = response.dati;
        this.datiPronti = true;
        this.isLoading.set(false);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento storia:', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  getImmagineUrl(filename: string): string {
    return `${this.apiUrl}/storage/${filename}`;
  }

  tornaAllaLista() {
    this.router.navigate(['/storie']);
  }

  apriLetture() {
    if (!this._storiaData) return;

    const dialogRef = this.dialog.open(LettureDialog, {
      width: '450px',
      maxWidth: '95vw',
      data: {
        tipo: 'storia',
        id: this._storiaData.id,
        titolo: this._storiaData.nome || `Storia #${this._storiaData.id}`
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.storiaService.getStoria(id).subscribe(r => {
        this._storiaData = r.dati;
        this.cdr.detectChanges();
      });
    });
  }

  etichettaStato(stato: string): string {
    const mappa: Record<string, string> = {
      'in_corso': 'In Corso',
      'autoconclusiva': 'Auto Conclusiva',
      'finita': 'Finita',
    };
    return mappa[stato] ?? stato;
  }

  etichettaRuolo(autore: any): string {
    // Il ruolo arriva come pivot.ruolo_id — mostriamo la descrizione se disponibile
    return autore.pivot?.ruolo?.descrizione ?? '';
  }

  get albiFiltrati(): any[] {
    if (!this._storiaData?.albi) return [];
    const start = this.paginaAlbi * this.ALBI_PER_PAGINA;
    return this._storiaData.albi.slice(start, start + this.ALBI_PER_PAGINA);
}

  get totaleAlbi(): number {
      return this._storiaData?.albi?.length ?? 0;
  }
  
  get pagineTotaliAlbi(): number {
      return Math.ceil(this.totaleAlbi / this.ALBI_PER_PAGINA);
  }
  
  get primoAlbi(): number {
      return this.paginaAlbi * this.ALBI_PER_PAGINA + 1;
  }
  
  get ultimoAlbi(): number {
      return Math.min((this.paginaAlbi + 1) * this.ALBI_PER_PAGINA, this.totaleAlbi);
  }
  
  paginaAlbiPrev() {
      if (this.paginaAlbi > 0) this.paginaAlbi--;
  }
  
  paginaAlbiNext() {
      if (this.paginaAlbi < this.pagineTotaliAlbi - 1) this.paginaAlbi++;
  }
}
