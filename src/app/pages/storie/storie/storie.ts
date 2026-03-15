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
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatSnackBarModule,
    RouterModule,
    LettureDialog,
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

  colonneMostrate: string[] = ['id', 'nome', 'stato', 'trama', 'letture', 'azioni'];

  constructor(
    private storiaService: StoriaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.caricaStorie(1);
  }

  caricaStorie(pagina: number) {
    this.isLoading.set(true);
    this.storiaService.getStorie(pagina).subscribe({
      next: (response) => {
        this.listaStorie.set(response.dati.data);
        this.totaleStorie.set(response.dati.total);
        this.paginaCorrente.set(response.dati.current_page - 1);
        if (response.dati.per_page) {
          this.elementiPerPagina.set(response.dati.per_page);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento storie:', err);
        this.isLoading.set(false);
      }
    });
  }

  cambiaPagina(event: PageEvent) {
    this.caricaStorie(event.pageIndex + 1);
  }

  saltaAPagina(inputElement: HTMLInputElement) {
    let paginaScelta = parseInt(inputElement.value, 10);
    if (paginaScelta < 1) {
      paginaScelta = 1;
      inputElement.value = '1';
    } else if (paginaScelta > this.pagineTotali()) {
      paginaScelta = this.pagineTotali();
      inputElement.value = this.pagineTotali().toString();
    }
    if (paginaScelta !== this.paginaCorrente() + 1) {
      this.caricaStorie(paginaScelta);
    }
  }

  // ➕ Nuova storia
  apriNuovaStoria() {
    const dialogRef = this.dialog.open(StoriaFormDialog, {
      width: '700px',
      disableClose: true,
      data: null
    });
    dialogRef.afterClosed().subscribe(risultato => {
      if (risultato === true) {
        this.caricaStorie(this.paginaCorrente() + 1);
        this.snackBar.open('Nuova storia aggiunta!', 'OK', { duration: 3000 });
      }
    });
  }

  // ✏️ Modifica storia
  apriModifica(storia: Storia) {
    const dialogRef = this.dialog.open(StoriaFormDialog, {
      width: '700px',
      disableClose: true,
      data: { storia }
    });
    dialogRef.afterClosed().subscribe(risultato => {
      if (risultato === true) {
        this.caricaStorie(this.paginaCorrente() + 1);
        this.snackBar.open('Storia modificata con successo!', 'OK', { duration: 3000 });
      }
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

  // 🗑️ Elimina storia
  apriConfermaEliminazione(storia: Storia) {
    const dialogRef = this.dialog.open(ConfermaDialogComponent, {
      width: '420px',
      data: {
        titolo: 'Conferma eliminazione',
        messaggio: `Sei sicuro di voler eliminare ${storia.nome ? '"' + storia.nome + '"' : 'questa storia'}? L'operazione è irreversibile.`,
        labelConferma: 'Elimina',
        labelAnnulla: 'Annulla'
      }
    });
    dialogRef.afterClosed().subscribe((confermato: boolean) => {
      if (confermato) {
        this.storiaService.deleteStoria(storia.id).subscribe({
          next: () => {
            const paginaDaCaricare = this.listaStorie().length === 1 && this.paginaCorrente() > 0
              ? this.paginaCorrente()
              : this.paginaCorrente() + 1;
            this.caricaStorie(paginaDaCaricare);
            this.snackBar.open('Storia eliminata.', 'OK', { duration: 3000 });
          },
          error: () => this.snackBar.open('Errore durante l\'eliminazione.', 'Chiudi', { duration: 4000 })
        });
      }
    });
  }
  apriLetture(albo: any): void {
    const dialogRef = this.dialog.open(LettureDialog, {
        width: '450px',
        data: {
            tipo: 'storia',
            id: albo.id,
            titolo: albo.titolo || `Albo #${albo.id}`
        }
    });
 
    // Quando il dialog si chiude ricarichiamo per aggiornare il conteggio
    dialogRef.afterClosed().subscribe(() => {
        this.caricaStorie(this.paginaCorrente() + 1);
    });
}

}