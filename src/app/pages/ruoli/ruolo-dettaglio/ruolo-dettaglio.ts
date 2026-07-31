import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ruolo-dettaglio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
  ],
  templateUrl: './ruolo-dettaglio.html',
  styleUrl: './ruolo-dettaglio.scss'
})
export class RuoloDettaglio implements OnInit {

  private _dati: any = null;
  isLoading = signal<boolean>(true);
  datiPronti = false;

  get ruolo(): any { return this._dati?.ruolo; }
  get classifica(): any[] { return this._dati?.classifica ?? []; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<any>(`${environment.apiUrl}/ruoli/${id}`).subscribe({
      next: (response) => {
        this._dati = response.dati;
        this.datiPronti = true;
        this.isLoading.set(false);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento ruolo:', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  tornaAllaLista() {
    this.router.navigate(['/ruoli']);
  }

  nomeAutore(autore: any): string {
    const parts = [autore.cognome];
    if (autore.pseudonimo) parts.push(`'${autore.pseudonimo}'`);
    if (autore.nome) parts.push(autore.nome);
    return parts.join(' ');
  }
}
