import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { AutoreService } from '../../../core/services/autore';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-autore-dettaglio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './autore-dettaglio.html',
  styleUrl: './autore-dettaglio.scss'
})
export class AutoreDettaglio implements OnInit {

  private _autoreData: any = null;
  isLoading = signal<boolean>(true);
  datiPronti = false;

  // Paginazione storie
  readonly STORIE_PER_PAGINA = 8;
  paginaStorie = 0;

  // Paginazione albi
  readonly ALBI_PER_PAGINA = 6;
  paginaAlbi = 0;

  apiUrl = environment.apiUrl.replace('/api/v1', '');

  get autore(): any {
    return this._autoreData;
  }

  // --- Getter storie paginate ---
  // Conteggio — storie uniche
get totaleStorie(): number {
    const storie = this._autoreData?.storie ?? [];
    return new Set(storie.map((s: any) => s.id)).size;
}

// Lista — tutte le righe storia+ruolo (senza deduplica)
get storieFiltrate(): any[] {
    const storie = this._autoreData?.storie ?? [];
    const start = this.paginaStorie * this.STORIE_PER_PAGINA;
    return storie.slice(start, start + this.STORIE_PER_PAGINA);
}

get totalRigheStorie(): number {
    return this._autoreData?.storie?.length ?? 0;
}

get pagineTotaliStorie(): number {
    return Math.ceil(this.totalRigheStorie / this.STORIE_PER_PAGINA);
}

get primaStoria(): number {
    return this.paginaStorie * this.STORIE_PER_PAGINA + 1;
}

get ultimaStoria(): number {
    return Math.min((this.paginaStorie + 1) * this.STORIE_PER_PAGINA, this.totalRigheStorie);
}

  // --- Getter albi paginati ---
  get albiFiltrati(): any[] {
    const albi = this._autoreData?.albi_copertina;
    if (!albi || albi.length === 0) return [];
    const start = this.paginaAlbi * this.ALBI_PER_PAGINA;
    return albi.slice(start, start + this.ALBI_PER_PAGINA);
  }

  get totaleAlbi(): number {
    return this._autoreData?.albi_copertina?.length ?? 0;
  }

  get pagineTotaliAlbi(): number {
    return Math.ceil(this.totaleAlbi / this.ALBI_PER_PAGINA);
  }

  get primoAlbo(): number {
    return this.paginaAlbi * this.ALBI_PER_PAGINA + 1;
  }

  get ultimoAlbo(): number {
    return Math.min((this.paginaAlbi + 1) * this.ALBI_PER_PAGINA, this.totaleAlbi);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private autoreService: AutoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.autoreService.getAutore(id).subscribe({
      next: (response) => {
        this._autoreData = response.dati;
        this.datiPronti = true;
        this.isLoading.set(false);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento autore:', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  getImmagineUrl(filename: string): string {
    return `${this.apiUrl}/storage/${filename}`;
  }

  tornaAllaLista() {
    this.router.navigate(['/autori']);
  }

  // Navigazione storie
  paginaStoriePrev() { if (this.paginaStorie > 0) this.paginaStorie--; }
  paginaStorieNext() { if (this.paginaStorie < this.pagineTotaliStorie - 1) this.paginaStorie++; }

  // Navigazione albi
  paginaAlbiPrev() { if (this.paginaAlbi > 0) this.paginaAlbi--; }
  paginaAlbiNext() { if (this.paginaAlbi < this.pagineTotaliAlbi - 1) this.paginaAlbi++; }

  // Nome completo autore con pseudonimo
  get nomeCompleto(): string {
    if (!this._autoreData) return '';
    const parts = [this._autoreData.cognome];
    if (this._autoreData.pseudonimo) parts.push(`'${this._autoreData.pseudonimo}'`);
    parts.push(this._autoreData.nome);
    return parts.filter(Boolean).join(' ');
  }
}
