import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AlboService } from '../../../core/services/albo';
import { environment } from '../../../../environments/environment';
import { LettureDialog } from '../../../shared/letture-dialog/letture-dialog';

@Component({
  selector: 'app-albo-dettaglio',
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
  templateUrl: './albo-dettaglio.html',
  styleUrl: './albo-dettaglio.scss'
})
export class AlboDettaglio implements OnInit {

  private _alboData: any = null;
  isLoading = signal<boolean>(true);
  datiPronti = false;

  apiUrl = environment.apiUrl.replace('/api/v1', '');

  get albo(): any {
    return this._alboData;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alboService: AlboService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.alboService.getAlbo(id).subscribe({
      next: (response) => {
        this._alboData = response.dati;
        this.datiPronti = true;
        this.isLoading.set(false);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento albo:', err);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  getImmagineUrl(filename: string): string {
    return `${this.apiUrl}/storage/${filename}`;
  }

  tornaAllaLista() {
    this.router.navigate(['/albi']);
  }

  apriLetture() {
    if (!this._alboData) return;

    const dialogRef = this.dialog.open(LettureDialog, {
      width: '450px',
      maxWidth: '95vw',
      data: {
        tipo: 'albo',
        id: this._alboData.id,
        titolo: this._alboData.titolo || `Albo #${this._alboData.id}`
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.alboService.getAlbo(id).subscribe(r => {
        this._alboData = r.dati;
        this.cdr.detectChanges();
      });
    });
  }

  getPrezzoFormattato(albo: any): string {
    if (!albo) return '-';
    
    if (albo.prezzo_lire) {
        // Tasso di conversione fisso lire → euro (1 euro = 1936.27 lire)
        const euro = (Number(albo.prezzo_lire) / 1936.27).toFixed(2);
        return `₤ ${Number(albo.prezzo_lire).toLocaleString('it-IT')} (€ ${euro})`;
    }
    
    if (albo.prezzo) return `€ ${Number(albo.prezzo).toFixed(2)}`;
    
    return '-';
}
}