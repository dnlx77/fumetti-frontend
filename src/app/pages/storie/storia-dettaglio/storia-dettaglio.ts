import { Component, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Chart, registerables } from 'chart.js';

import { StoriaService } from '../../../core/services/storia';
import { environment } from '../../../../environments/environment';
import { LettureDialog } from '../../../shared/letture-dialog/letture-dialog';

Chart.register(...registerables);

const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

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
export class StoriaDettaglio implements OnInit, OnDestroy {

  private _storiaData: any = null;
  private _graficiData: any = null;
  private charts: Chart[] = [];

  isLoading = signal<boolean>(true);
  datiPronti = false;

  readonly ALBI_PER_PAGINA = 5;
  paginaAlbi = 0;

  apiUrl = environment.apiUrl.replace('/api/v1', '');

  get storia(): any { return this._storiaData; }

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
        this._graficiData = response.grafici;
        this.datiPronti = true;
        this.isLoading.set(false);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        setTimeout(() => this.inizializzaGrafici(), 100);
      },
      error: (err) => {
        console.error('Errore caricamento storia:', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  inizializzaGrafici() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    if (!this._graficiData) return;

    this.creaGraficoPubblicati();
    this.creaGraficoLetti();
  }

  private labelAnnoMese(d: any): string {
    return `${MESI[d.mese - 1]} ${d.anno}`;
  }
  
  private buildSerieMensile(dati: any[]): { labels: string[], valori: number[] } {
    if (!dati || dati.length === 0) return { labels: [], valori: [] };

    // Trova min e max anno/mese
    const primo = dati[0];
    const ultimo = dati[dati.length - 1];

    // Mappa i dati per lookup rapido
    const mappa = new Map<string, number>();
    dati.forEach(d => mappa.set(`${d.anno}-${d.mese}`, d.totale));

    const labels: string[] = [];
    const valori: number[] = [];

    let anno = primo.anno;
    let mese = primo.mese;

    while (anno < ultimo.anno || (anno === ultimo.anno && mese <= ultimo.mese)) {
        labels.push(`${MESI[mese - 1]} ${anno}`);
        valori.push(mappa.get(`${anno}-${mese}`) ?? 0);

        mese++;
        if (mese > 12) { mese = 1; anno++; }
    }

    return { labels, valori };
  }

  private creaGraficoPubblicati() {
    const canvas = document.getElementById('chartAlbiPubblicati') as HTMLCanvasElement;
    if (!canvas) return;
    const { labels, valori } = this.buildSerieMensile(this._graficiData.albi_pubblicati ?? []);
    this.charts.push(new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Albi pubblicati', data: valori, backgroundColor: '#3f51b5', borderRadius: 4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    }));
}

private creaGraficoLetti() {
    const canvas = document.getElementById('chartAlbiLetti') as HTMLCanvasElement;
    if (!canvas) return;
    const { labels, valori } = this.buildSerieMensile(this._graficiData.albi_letti ?? []);
    this.charts.push(new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Albi letti', data: valori, backgroundColor: '#4caf50', borderRadius: 4 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    }));
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
        this._graficiData = r.grafici;
        this.cdr.detectChanges();
        setTimeout(() => this.inizializzaGrafici(), 100);
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
    return autore.pivot?.ruolo?.descrizione ?? '';
  }

  get albiFiltrati(): any[] {
    if (!this._storiaData?.albi) return [];
    const start = this.paginaAlbi * this.ALBI_PER_PAGINA;
    return this._storiaData.albi.slice(start, start + this.ALBI_PER_PAGINA);
  }

  get totaleAlbi(): number { return this._storiaData?.albi?.length ?? 0; }
  get pagineTotaliAlbi(): number { return Math.ceil(this.totaleAlbi / this.ALBI_PER_PAGINA); }
  get primoAlbi(): number { return this.paginaAlbi * this.ALBI_PER_PAGINA + 1; }
  get ultimoAlbi(): number { return Math.min((this.paginaAlbi + 1) * this.ALBI_PER_PAGINA, this.totaleAlbi); }
  paginaAlbiPrev() { if (this.paginaAlbi > 0) this.paginaAlbi--; }
  paginaAlbiNext() { if (this.paginaAlbi < this.pagineTotaliAlbi - 1) this.paginaAlbi++; }

  get haGraficoPubblicati(): boolean { return (this._graficiData?.albi_pubblicati?.length ?? 0) > 0; }
  get haGraficoLetti(): boolean { return (this._graficiData?.albi_letti?.length ?? 0) > 0; }
}