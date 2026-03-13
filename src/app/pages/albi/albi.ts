import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// Importiamo il servizio e l'interfaccia
import { AlboService } from '../../core/services/albo';
import { Albo } from '../../core/models/albo';
import { environment } from '../../../environments/environment';

import { AlboFormDialog } from './albo-form-dialog/albo-form-dialog';

@Component({
	selector: 'app-albi',
	standalone: true,
	imports: [
	    CommonModule,
	    MatTableModule,
		MatPaginatorModule,
		MatButtonModule,
		MatDialogModule
	], 
	templateUrl: './albi.html',
	styleUrl: './albi.scss'
})
export class Albi implements OnInit {
	// Usiamo i Signals per gestire i dati in modo iper-reattivo
	listaAlbi = signal<Albo[]>([]);
	isLoading = signal<boolean>(true); // Per mostrare un "Caricamento..."

	// Nuovi Signals per la paginazione!
	totaleAlbi = signal<number>(0);
	paginaCorrente = signal<number>(0); // Per Angular la prima pagina è la 0
	elementiPerPagina = signal<number>(50); // mettiamo 50 di base, ma si aggiornerà da solo
	pagineTotali = computed(() => Math.ceil(this.totaleAlbi() / this.elementiPerPagina()));

	// Prepariamo l'URL base per il backend (dove Laravel salva le immagini)
	// Assumi che Laravel esponga lo storage su http://localhost:8000/storage/
	apiUrl = environment.apiUrl.replace('/api/v1', ''); 

	// Definiamo in che ordine vogliamo vedere le colonne nella tabella
	colonneMostrate: string[] = ['copertina', 'id', 'titolo', 'numero', 'collana', 'editore', 'data_pubblicazione'];
	
	constructor(
		private alboService: AlboService,
		private dialog: MatDialog
	) {}
	
	getImmagineUrl(filename: string): string {
		// Sostituisci 'albi' con il nome della cartella in cui il tuo 
		// AlboController di Laravel salva effettivamente i file (es. 'copertine', 'images' ecc.)
		// Se li salvi nella root dello storage, togli '/albi'.
		return `${this.apiUrl}/storage/${filename}`; 
  	}

  	// Questo metodo parte in automatico appena la pagina viene aperta
	ngOnInit() {
		this.caricaFumetti(1);
	}

	// Modifichiamo la funzione per accettare il numero di pagina
	caricaFumetti(pagina: number) {
		this.isLoading.set(true);
		
    	this.alboService.getAlbi(pagina).subscribe({
    		next: (response) => {
    			this.listaAlbi.set(response.dati.data);
				
    			// Salviamo il totale dei fumetti leggendo la risposta di Laravel
    			// (Assicurati che nell'interfaccia PaginatedResponse ci sia 'total: number')
    			this.totaleAlbi.set(response.dati.total); 
				
    			// Sincronizziamo il paginatore di Angular (sottraendo 1)
    			this.paginaCorrente.set(response.dati.current_page - 1);

				if (response.dati.per_page) {
          			this.elementiPerPagina.set(response.dati.per_page);
        		}
				
    			this.isLoading.set(false);
    		},
    		error: (err) => {
    			console.error('Errore API:', err);
    			this.isLoading.set(false);
    		}
		});
  	}

// Questo metodo scatta quando l'utente clicca le freccette del paginatore
	cambiaPagina(event: PageEvent) {
		// Angular ci dà l'indice (es. 1 per la seconda pagina), noi sommiamo 1 per Laravel
    	const paginaRichiesta = event.pageIndex + 1;
    	this.caricaFumetti(paginaRichiesta);
  	}

	saltaAPagina(inputElement: HTMLInputElement) {
   		let paginaScelta = parseInt(inputElement.value, 10);

   		// Protezione: se l'utente scrive "pagina -5" o "pagina 1000", lo correggiamo
   		if (paginaScelta < 1) {
   			paginaScelta = 1;
   			inputElement.value = '1';
   		} else if (paginaScelta > this.pagineTotali()) {
   			paginaScelta = this.pagineTotali();
   			inputElement.value = this.pagineTotali().toString();
   		}

   		// Se la pagina è diversa da quella in cui siamo già, carichiamo!
   		if (paginaScelta !== (this.paginaCorrente() + 1)) {
   		  	this.caricaFumetti(paginaScelta);
   		}
  	}

	apriModaleNuovoAlbo() {
    	const dialogRef = this.dialog.open(AlboFormDialog, {
    		width: '750px', // Decidiamo quanto deve essere larga
			maxWidth: '95vw',
    		disableClose: true // Impedisce di chiuderla cliccando fuori (utile se l'utente sta scrivendo!)
    	});
	
    	// Quando la finestra si chiude, eseguiamo questo codice
    	dialogRef.afterClosed().subscribe(risultato => {
    		if (risultato === 'salvato') {
    	    	// Se la modale ci dice che ha salvato, ricarichiamo la pagina 1 per vedere il nuovo albo!
    	    	this.caricaFumetti(1);
    		}
    	});
	}
}