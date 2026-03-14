import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Chart, registerables } from 'chart.js';

import { DashboardService, DashboardData } from '../../core/services/dashboard';
import { environment } from '../../../environments/environment';

// Registriamo tutti i tipi di grafici di Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, AfterViewInit {

  dati = signal<DashboardData | null>(null);
  isLoading = signal<boolean>(true);

  apiUrl = environment.apiUrl.replace('/api/v1', '');

  // Riferimenti ai canvas dei grafici
  @ViewChildren('chartEditore, chartAnno, chartStato')
  chartCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  private charts: Chart[] = [];

  // Stato del carosello
  caroselloIndex = signal<number>(0);
  readonly CARD_WIDTH = 160; // px — larghezza card carosello + gap

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        this.dati.set(response.dati);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento dashboard:', err);
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    // Osserviamo quando i dati arrivano per inizializzare i grafici
    // (i canvas esistono nel DOM solo dopo che isLoading diventa false)
  }

  // Chiamato dal template quando i dati sono pronti e i canvas sono visibili
  inizializzaGrafici() {
    const d = this.dati();
    if (!d) return;

    // Distruggiamo eventuali grafici precedenti
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    setTimeout(() => {
      this.creaGraficoEditori(d);
      this.creaGraficoAnni(d);
      this.creaGraficoStati(d);
    }, 0);
  }

  private creaGraficoEditori(d: DashboardData) {
    const canvas = document.getElementById('chartEditore') as HTMLCanvasElement;
    if (!canvas) return;

    this.charts.push(new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: d.albi_per_editore.map(e => e.nome),
        datasets: [{
          data: d.albi_per_editore.map(e => e.totale),
          backgroundColor: [
            '#3f51b5', '#e91e63', '#ff9800', '#4caf50',
            '#00bcd4', '#9c27b0', '#f44336', '#795548'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: { size: 12 } } }
        }
      }
    }));
  }

  private creaGraficoAnni(d: DashboardData) {
    const canvas = document.getElementById('chartAnno') as HTMLCanvasElement;
    if (!canvas) return;

    this.charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: d.albi_per_anno.map(a => a.anno.toString()),
        datasets: [{
          label: 'Albi pubblicati',
          data: d.albi_per_anno.map(a => a.totale),
          backgroundColor: '#3f51b5',
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    }));
  }

  private creaGraficoStati(d: DashboardData) {
    const canvas = document.getElementById('chartStato') as HTMLCanvasElement;
    if (!canvas) return;

    const etichette: Record<string, string> = {
      'in_corso': 'In Corso',
      'autoconclusiva': 'Auto Conclusiva',
      'finita': 'Finita',
    };

    const colori: Record<string, string> = {
      'in_corso': '#ff9800',
      'autoconclusiva': '#4caf50',
      'finita': '#3f51b5',
    };

    this.charts.push(new Chart(canvas, {
      type: 'pie',
      data: {
        labels: d.storie_per_stato.map(s => etichette[s.stato] ?? s.stato),
        datasets: [{
          data: d.storie_per_stato.map(s => s.totale),
          backgroundColor: d.storie_per_stato.map(s => colori[s.stato] ?? '#999'),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    }));
  }

  // --- CAROSELLO ---
  caroselloPrev() {
    const max = (this.dati()?.ultimi_albi.length ?? 0) - 1;
    this.caroselloIndex.update(i => i > 0 ? i - 1 : max);
  }

  caroselloNext() {
    const max = (this.dati()?.ultimi_albi.length ?? 0) - 1;
    this.caroselloIndex.update(i => i < max ? i + 1 : 0);
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
}
