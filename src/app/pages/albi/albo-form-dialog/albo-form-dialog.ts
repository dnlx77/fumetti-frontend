import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { MatChipsModule } from '@angular/material/chips';
import { Observable, forkJoin } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { AlboService } from '../../../core/services/albo';

@Component({
  selector: 'app-albo-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,         // <-- Aggiunto
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule   // <-- Aggiunto
  ],
  templateUrl: './albo-form-dialog.html',
  styleUrl: './albo-form-dialog.scss'
})
export class AlboFormDialog implements OnInit {
  alboForm!: FormGroup;
  fileCopertina: File | null = null;

  // Dati finti (mock)
  editori: any[]= [];
  collane: any[] = [];
  autoriList: any[] = []; // (Ex autoriMock)
  storieList: any[] = []; // (Ex storieMock)
  // Variabili per i risultati della ricerca in tempo reale
  editoriFiltrati!: Observable<any[]>;
  collaneFiltrate!: Observable<any[]>;
  autoriFiltrati!: Observable<any[]>;
  storieFiltrate!: Observable<any[]>;

  // --- VARIABILI PER I CHIPS ---
  autoriInputCtrl = new FormControl(''); // Controlla cosa scrivi nel campo Autori
  storieInputCtrl = new FormControl(''); // Controlla cosa scrivi nel campo Storie

  // Array che conterranno gli elementi EFFETTIVAMENTE selezionati (i chips visibili)
  autoriSelezionati: any[] = [];
  storieSelezionate: any[] = [];

  // Riferimenti all'HTML per svuotare il campo dopo aver scelto un'opzione
  @ViewChild('autoreInput') autoreInput!: ElementRef<HTMLInputElement>;
  @ViewChild('storiaInput') storiaInput!: ElementRef<HTMLInputElement>;

  constructor(
    private dialogRef: MatDialogRef<AlboFormDialog>,
    private fb: FormBuilder,
    private alboService: AlboService
  ) {}

  ngOnInit() {
    this.alboForm = this.fb.group({
      titolo: [''],
      numero: [''],
      num_pagine: [''],
      data_pubblicazione: [''],
      barcode: [''],                 
      prezzo: [''],                  
      valuta_prezzo: ['euro'],       
      editore: ['', Validators.required], 
      collana: [''],
    });

    // LA MAGIA: Scarichiamo tutto in parallelo!
    forkJoin({
      editoriRes: this.alboService.getEditori(),
      collaneRes: this.alboService.getCollane(),
      autoriRes: this.alboService.getAutori(),
      storieRes: this.alboService.getStorie()
    }).subscribe({
      next: (risposte) => {
        // Assegniamo i dati ricevuti da Laravel ai nostri array
        this.editori = risposte.editoriRes.dati;
        this.collane = risposte.collaneRes.dati;
        this.autoriList = risposte.autoriRes.dati;
        this.storieList = risposte.storieRes.dati;

        // SOLO ORA CHE ABBIAMO I DATI, ACCENDIAMO I FILTRI DEI CAMPI!
        this.inizializzaFiltriAutocomplete();
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei dizionari:', err);
      }
    });
  } // <-- QUESTA GRAFFA CHIUDE ngOnInit(). Mancava nel tuo codice!

  // --- ORA INIZIA LA NUOVA FUNZIONE ---
  inizializzaFiltriAutocomplete() {
    this.editoriFiltrati = this.alboForm.get('editore')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const nome = typeof value === 'string' ? value : value?.nome;
        return nome ? this._filtra(nome as string, this.editori) : this.editori.slice();
      })
    );

    this.collaneFiltrate = this.alboForm.get('collana')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const nome = typeof value === 'string' ? value : value?.nome;
        return nome ? this._filtra(nome as string, this.collane) : this.collane.slice();
      })
    );

    this.autoriFiltrati = this.autoriInputCtrl.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        // Se è una stringa usa quella, se è un oggetto usa la proprietà 'nome', altrimenti vuoto
        const stringaRicerca = typeof value === 'string' ? value : value?.nome;
        return stringaRicerca ? this._filtra(stringaRicerca as string, this.autoriList) : this.autoriList.slice();
      })
    );

    // --- FILTRO STORIE PROTETTO ---
    this.storieFiltrate = this.storieInputCtrl.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        const stringaRicerca = typeof value === 'string' ? value : value?.nome;
        return stringaRicerca ? this._filtra(stringaRicerca as string, this.storieList) : this.storieList.slice();
      })
    );
  }

  // Funzione universale per filtrare gli array
  private _filtra(nome: string, lista: any[]): any[] {
    const filtro = nome.toLowerCase();
    return lista.filter(item => item.nome.toLowerCase().includes(filtro));
  }

  // Funzione che dice ad Angular cosa mostrare nel campo di testo dopo aver selezionato un'opzione
  mostraNome(item: any): string {
    return item && item.nome ? item.nome : '';
  }

  // --- LOGICA AUTORI CHIPS ---
  rimuoviAutore(autore: any): void {
    const index = this.autoriSelezionati.indexOf(autore);
    if (index >= 0) {
      this.autoriSelezionati.splice(index, 1);
    }
  }

  selezionaAutore(event: MatAutocompleteSelectedEvent): void {
    const autoreScelto = event.option.value;
    // Evitiamo i doppioni
    if (!this.autoriSelezionati.find(a => a.id === autoreScelto.id)) {
      this.autoriSelezionati.push(autoreScelto);
    }
    // Svuotiamo l'input per cercare il prossimo
    this.autoreInput.nativeElement.value = '';
    this.autoriInputCtrl.setValue(null);
  }

  // --- LOGICA STORIE CHIPS ---
  rimuoviStoria(storia: any): void {
    const index = this.storieSelezionate.indexOf(storia);
    if (index >= 0) {
      this.storieSelezionate.splice(index, 1);
    }
  }

  selezionaStoria(event: MatAutocompleteSelectedEvent): void {
    const storiaScelta = event.option.value;
    if (!this.storieSelezionate.find(s => s.id === storiaScelta.id)) {
      this.storieSelezionate.push(storiaScelta);
    }
    this.storiaInput.nativeElement.value = '';
    this.storieInputCtrl.setValue(null);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileCopertina = file;
    }
  }

  chiudi() {
    this.dialogRef.close('annullato');
  }

  salva() {
    if (this.alboForm.valid) {
      const formData = new FormData();
      const valori = this.alboForm.value;

      // 1. Aggiungiamo i campi testuali/numerici base
      formData.append('titolo', valori.titolo);
      
      // I campi non obbligatori li aggiungiamo solo se l'utente li ha compilati
      if (valori.numero) formData.append('numero', valori.numero);
      if (valori.num_pagine) formData.append('num_pagine', valori.num_pagine);
      if (valori.data_pubblicazione) formData.append('data_pubblicazione', valori.data_pubblicazione);
      if (valori.barcode) formData.append('barcode', valori.barcode);
      if (valori.prezzo) {
        if (valori.valuta_prezzo === 'lire') {
          // Se il toggle è su Lire, inviamo come 'prezzo_lire'
          formData.append('prezzo_lire', valori.prezzo);
        } else {
          // Se il toggle è su Euro (o default), inviamo come 'prezzo'
          formData.append('prezzo', valori.prezzo);
        }
      }

      // 2. Per le tendine (Editore e Collana), estraiamo solo l'ID!
      if (valori.editore && valori.editore.id) {
        formData.append('editore_id', valori.editore.id);
      }
      if (valori.collana && valori.collana.id) {
        formData.append('collana_id', valori.collana.id);
      }

      // 3. Per i Chips (Autori e Storie), inviamo un array di ID a Laravel!
      // In FormData un array si scrive aggiungendo le parentesi quadre al nome: 'autori[]'
      this.autoriSelezionati.forEach(autore => {
        formData.append('autori_copertina[]', autore.id);
      });

      this.storieSelezionate.forEach(storia => {
        formData.append('storie[]', storia.id);
      });

      // 4. Aggiungiamo il file immagine (se l'utente l'ha caricato)
      if (this.fileCopertina) {
        formData.append('file_copertina', this.fileCopertina, this.fileCopertina.name);
      }

      // 5. SPEDIAMO A LARAVEL! 🚀
      this.alboService.creaAlbo(formData).subscribe({
        next: (risposta) => {
          console.log('Albo salvato con successo nel DB!', risposta);
          // Chiudiamo la modale e passiamo "true" al componente padre per dirgli di ricaricare la tabella
          this.dialogRef.close(true); 
        },
        error: (errore) => {
          console.error('Errore orribile durante il salvataggio:', errore);
          // Qui potresti mostrare un messaggio di errore all'utente (es. uno Snackbar)
        }
      });

    } else {
      // Se il form non è valido (es. manca il titolo), evidenziamo i campi rossi
      this.alboForm.markAllAsTouched();
    }
  }
}