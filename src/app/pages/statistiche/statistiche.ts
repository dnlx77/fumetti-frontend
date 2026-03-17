import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Chart, registerables } from 'chart.js';

import { StatisticheService } from '../../core/services/statistiche';
import { environment } from '../../../environments/environment';

Chart.register(...registerables);

// Nomi mesi italiani
const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

@Component({
  selector: 'app-statistiche',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './statistiche.html',
  styleUrl: './statistiche.scss'
})
export class Statistiche implements OnInit {

  private _dati: any = null;
  datiPronti = false;
  isLoading = true;

  // Heatmap
  heatmapDa: string = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  heatmapA: string = new Date().toISOString().split('T')[0];
  heatmapAlbiDati: any[] = [];
  heatmapStorieDati: any[] = [];

  apiUrl = environment.apiUrl.replace('/api/v1', '');
  private charts: Chart[] = [];

  get dati(): any { return this._dati; }

  constructor(
    private statisticheService: StatisticheService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.statisticheService.getStatistiche().subscribe({
      next: (response) => {
        this._dati = response.dati;
        this.datiPronti = true;
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        setTimeout(() => this.inizializzaGrafici(), 100);
      },
      error: (err) => {
        console.error('Errore statistiche:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.caricaHeatmap();
  }

  // ================================
  // HEATMAP
  // ================================
  caricaHeatmap() {
    this.statisticheService.getHeatmapAlbi(this.heatmapDa, this.heatmapA).subscribe({
      next: (r) => { this.heatmapAlbiDati = r.dati; this.cdr.detectChanges(); }
    });
    this.statisticheService.getHeatmapStorie(this.heatmapDa, this.heatmapA).subscribe({
      next: (r) => { this.heatmapStorieDati = r.dati; this.cdr.detectChanges(); }
    });
  }

  // Pulsanti rapidi heatmap
  setRangeQuestoMese() {
    const ora = new Date();
    this.heatmapDa = new Date(ora.getFullYear(), ora.getMonth(), 1).toISOString().split('T')[0];
    this.heatmapA  = ora.toISOString().split('T')[0];
    this.caricaHeatmap();
  }

  setRangeUltimi3Mesi() {
    const ora = new Date();
    const da  = new Date(ora.getFullYear(), ora.getMonth() - 2, 1);
    this.heatmapDa = da.toISOString().split('T')[0];
    this.heatmapA  = ora.toISOString().split('T')[0];
    this.caricaHeatmap();
  }

  setRangeQuestAnno() {
    const ora = new Date();
    this.heatmapDa = new Date(ora.getFullYear(), 0, 1).toISOString().split('T')[0];
    this.heatmapA  = ora.toISOString().split('T')[0];
    this.caricaHeatmap();
  }

  setRangeAnnoScorso() {
    const anno = new Date().getFullYear() - 1;
    this.heatmapDa = `${anno}-01-01`;
    this.heatmapA  = `${anno}-12-31`;
    this.caricaHeatmap();
  }

  setRangeTutto() {
    const primaData = this._dati?.letture?.prima_data ?? '2000-01-01';
    this.heatmapDa = primaData;
    this.heatmapA  = new Date().toISOString().split('T')[0];
    this.caricaHeatmap();
  }

  // Costruisce la griglia heatmap per il template
  buildHeatmap(dati: any[]): { data: string; totale: number; livello: number }[] {
    const mappa = new Map<string, number>();
    dati.forEach(d => mappa.set(d.data, d.totale));

    const risultato = [];
    const da = new Date(this.heatmapDa);
    const a  = new Date(this.heatmapA);

    for (let d = new Date(da); d <= a; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      const totale = mappa.get(key) ?? 0;
      risultato.push({
        data: key,
        totale,
        livello: totale === 0 ? 0 : totale === 1 ? 1 : totale <= 3 ? 2 : totale <= 5 ? 3 : 4
      });
    }
    return risultato;
  }

  // ================================
  // GRAFICI Chart.js
  // ================================
  inizializzaGrafici() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const d = this._dati;
    if (!d) return;

    this.creaGraficoEditore(d);
    this.creaGraficoCollana(d);
    this.creaGraficoAnnoPubblicazione(d);
    this.creaGraficoLetturePerMese(d);
    this.creaGraficoLetturePerAnno(d);
    this.creaGraficoStorieStato(d);
    this.creaGraficoTopAutoriStorie(d);
    this.creaGraficoTopAutoriAlbi(d);
  }

  private creaGrafico(id: string, config: any) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    this.charts.push(new Chart(canvas, config));
  }

  private creaGraficoEditore(d: any) {
    this.creaGrafico('chartEditore', {
      type: 'doughnut',
      data: {
        labels: d.collezione.per_editore.map((e: any) => e.nome),
        datasets: [{ data: d.collezione.per_editore.map((e: any) => e.totale),
          backgroundColor: ['#3f51b5','#e91e63','#ff9800','#4caf50','#00bcd4','#9c27b0','#f44336','#795548','#607d8b','#ffeb3b'],
          borderWidth: 2, borderColor: '#fff' }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });
  }

  private creaGraficoCollana(d: any) {
    this.creaGrafico('chartCollana', {
      type: 'bar',
      data: {
        labels: d.collezione.per_collana.map((c: any) => c.nome),
        datasets: [{ label: 'Albi', data: d.collezione.per_collana.map((c: any) => c.totale),
          backgroundColor: '#3f51b5', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });
  }

  private creaGraficoAnnoPubblicazione(d: any) {
    this.creaGrafico('chartAnnoPub', {
      type: 'bar',
      data: {
        labels: d.collezione.per_anno_pubblicazione.map((a: any) => a.anno),
        datasets: [{ label: 'Albi', data: d.collezione.per_anno_pubblicazione.map((a: any) => a.totale),
          backgroundColor: '#7986cb', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  private creaGraficoLetturePerMese(d: any) {
    const labels = d.letture.per_mese.map((m: any) => `${MESI[m.mese - 1]} ${m.anno}`);
    this.creaGrafico('chartLetturePerMese', {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: 'Letture', data: d.letture.per_mese.map((m: any) => m.totale),
          borderColor: '#3f51b5', backgroundColor: 'rgba(63,81,181,0.1)',
          fill: true, tension: 0.4, pointRadius: 3 }]
      },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  private creaGraficoLetturePerAnno(d: any) {
    this.creaGrafico('chartLetturePerAnno', {
      type: 'bar',
      data: {
        labels: d.letture.per_anno.map((a: any) => a.anno),
        datasets: [{ label: 'Letture', data: d.letture.per_anno.map((a: any) => a.totale),
          backgroundColor: '#e91e63', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  private creaGraficoStorieStato(d: any) {
    const etichette: Record<string, string> = {
      'in_corso': 'In Corso', 'autoconclusiva': 'Auto Conclusiva', 'finita': 'Finita'
    };
    const colori: Record<string, string> = {
      'in_corso': '#ff9800', 'autoconclusiva': '#4caf50', 'finita': '#3f51b5'
    };
    this.creaGrafico('chartStorieStato', {
      type: 'pie',
      data: {
        labels: d.storie.per_stato.map((s: any) => etichette[s.stato] ?? s.stato),
        datasets: [{ data: d.storie.per_stato.map((s: any) => s.totale),
          backgroundColor: d.storie.per_stato.map((s: any) => colori[s.stato] ?? '#999'),
          borderWidth: 2, borderColor: '#fff' }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });
  }

  private creaGraficoTopAutoriStorie(d: any) {
    this.creaGrafico('chartTopAutoriStorie', {
      type: 'bar',
      data: {
        labels: d.top_autori.per_storie.map((a: any) => `${a.cognome} ${a.nome}`),
        datasets: [{ label: 'Storie', data: d.top_autori.per_storie.map((a: any) => a.totale),
          backgroundColor: '#9c27b0', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });
  }

  private creaGraficoTopAutoriAlbi(d: any) {
    this.creaGrafico('chartTopAutoriAlbi', {
      type: 'bar',
      data: {
        labels: d.top_autori.per_albi_copertina.map((a: any) => `${a.cognome} ${a.nome}`),
        datasets: [{ label: 'Albi', data: d.top_autori.per_albi_copertina.map((a: any) => a.totale),
          backgroundColor: '#ff9800', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
    });
  }

  // Utility
  getImmagineUrl(filename: string): string {
    return `${this.apiUrl}/storage/${filename}`;
  }

  nomeMese(mese: number): string {
    return MESI[mese - 1] ?? '';
  }

  nomeAutore(autore: any): string {
    if (!autore) return '';
    const parts = [autore.cognome];
    if (autore.pseudonimo) parts.push(`'${autore.pseudonimo}'`);
    parts.push(autore.nome);
    return parts.filter(Boolean).join(' ');
  }
}
