import { Component, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
import { Albo } from '../../../core/models/albo';

// Interfaccia per i dati passati al dialog dall'esterno
export interface AlboDialogData {
  albo?: Albo; // Se presente = modalità MODIFICA, se assente = modalità CREA
}

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
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './albo-form-dialog.html',
  styleUrl: './albo-form-dialog.scss'
})
export class AlboFormDialog implements OnInit {
  alboForm!: FormGroup;
  fileCopertina: File | null = null;

  // Proprietà che ci dice in quale modalità siamo
  get isModifica(): boolean {
    return !!this.data?.albo;
  }

  // Dati per i campi autocomplete
  editori: any[] = [];
  collane: any[] = [];
  autoriList: any[] = [];
  storieList: any[] = [];

  // Observable per i filtri autocomplete
  editoriFiltrati!: Observable<any[]>;
  collaneFiltrate!: Observable<any[]>;
  autoriFiltrati!: Observable<any[]>;
  storieFiltrate!: Observable<any[]>;

  // Controlli per i campi chip (autori e storie)
  autoriInputCtrl = new FormControl('');
  storieInputCtrl = new FormControl('');

  // Chip selezionati
  autoriSelezionati: any[] = [];
  storieSelezionate: any[] = [];

  // Riferimenti al DOM per svuotare l'input dopo la selezione
  @ViewChild('autoreInput') autoreInput!: ElementRef<HTMLInputElement>;
  @ViewChild('storiaInput') storiaInput!: ElementRef<HTMLInputElement>;

  constructor(
    private dialogRef: MatDialogRef<AlboFormDialog>,
    private fb: FormBuilder,
    private alboService: AlboService,
    // MAT_DIALOG_DATA contiene i dati passati da chi apre il dialog.
    // Usiamo "| null" perché quando creiamo un nuovo albo non passiamo nulla.
    @Inject(MAT_DIALOG_DATA) public data: AlboDialogData | null
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

    // Carichiamo tutti i dizionari in parallelo
    forkJoin({
      editoriRes: this.alboService.getEditori(),
      collaneRes: this.alboService.getCollane(),
      autoriRes: this.alboService.getAutori(),
      storieRes: this.alboService.getStorie()
    }).subscribe({
      next: (risposte) => {
        this.editori = risposte.editoriRes.dati;
        this.collane = risposte.collaneRes.dati;
        this.autoriList = risposte.autoriRes.dati;
        this.storieList = risposte.storieRes.dati;

        // Prima accendiamo i filtri autocomplete...
        this.inizializzaFiltriAutocomplete();

        // ...poi, se siamo in modalità MODIFICA, precompiliamo il form con i dati esistenti
        if (this.isModifica) {
          this.precompilaForm();
        }
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei dizionari:', err);
      }
    });
  }

  // Precompila il form con i dati dell'albo da modificare
  precompilaForm() {
    const albo = this.data!.albo!;

    // Troviamo gli oggetti completi nei dizionari (servono per i campi autocomplete)
    const editoreOggetto = albo.editore
      ? this.editori.find(e => e.id === albo.editore!.id) ?? null
      : null;

    const collanaOggetto = albo.collana
      ? this.collane.find(c => c.id === albo.collana!.id) ?? null
      : null;
    // Determiniamo quale campo prezzo è valorizzato
    const prezzoLire = (albo as any).prezzo_lire;
    const prezzoEuro = (albo as any).prezzo;
    const prezzo = prezzoLire ?? prezzoEuro ?? '';
    const valuta = prezzoLire ? 'lire' : 'euro';
    
    this.alboForm.patchValue({
      titolo: albo.titolo ?? '',
      numero: albo.numero ?? '',
      num_pagine: (albo as any).num_pagine ?? '',
      data_pubblicazione: albo.data_pubblicazione ?? '',
      barcode: (albo as any).barcode ?? '',
      prezzo: prezzo,         // ← il valore giusto (lire o euro)
      valuta_prezzo: valuta,  // ← il toggle giusto
      editore: editoreOggetto,
      collana: collanaOggetto,
    });

    // Precompiliamo i chip di autori e storie (se il backend li restituisce)
    if ((albo as any).autori_copertina) {
      this.autoriSelezionati = (albo as any).autori_copertina.map((a: any) =>
        this.autoriList.find(al => al.id === a.id) ?? a
      );
    }
    if ((albo as any).storie) {
      this.storieSelezionate = (albo as any).storie.map((s: any) =>
        this.storieList.find(sl => sl.id === s.id) ?? s
      );
    }
  }

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
        const stringaRicerca = typeof value === 'string' ? value : value?.nome;
        return stringaRicerca ? this._filtra(stringaRicerca as string, this.autoriList) : this.autoriList.slice();
      })
    );

    this.storieFiltrate = this.storieInputCtrl.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        const stringaRicerca = typeof value === 'string' ? value : value?.nome;
        return stringaRicerca ? this._filtra(stringaRicerca as string, this.storieList) : this.storieList.slice();
      })
    );
  }

  private _filtra(nome: string, lista: any[]): any[] {
    const filtro = nome.toLowerCase();
    return lista.filter(item => item.nome.toLowerCase().includes(filtro));
  }

  mostraNome(item: any): string {
    return item && item.nome ? item.nome : '';
  }

  // --- LOGICA CHIPS AUTORI ---
  rimuoviAutore(autore: any): void {
    const index = this.autoriSelezionati.indexOf(autore);
    if (index >= 0) this.autoriSelezionati.splice(index, 1);
  }

  selezionaAutore(event: MatAutocompleteSelectedEvent): void {
    const autoreScelto = event.option.value;
    if (!this.autoriSelezionati.find(a => a.id === autoreScelto.id)) {
      this.autoriSelezionati.push(autoreScelto);
    }
    this.autoreInput.nativeElement.value = '';
    this.autoriInputCtrl.setValue(null);
  }

  // --- LOGICA CHIPS STORIE ---
  rimuoviStoria(storia: any): void {
    const index = this.storieSelezionate.indexOf(storia);
    if (index >= 0) this.storieSelezionate.splice(index, 1);
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
    if (file) this.fileCopertina = file;
  }

  chiudi() {
    this.dialogRef.close('annullato');
  }

  salva() {
    if (this.alboForm.valid) {
      const formData = new FormData();
      const valori = this.alboForm.value;

      // Campi testuali base
      formData.append('titolo', valori.titolo);
      if (valori.numero) formData.append('numero', valori.numero);
      if (valori.num_pagine) formData.append('num_pagine', valori.num_pagine);
      if (valori.data_pubblicazione) formData.append('data_pubblicazione', valori.data_pubblicazione);
      if (valori.barcode) formData.append('barcode', valori.barcode);
      if (valori.prezzo) {
        if (valori.valuta_prezzo === 'lire') {
          formData.append('prezzo_lire', valori.prezzo);
        } else {
          formData.append('prezzo', valori.prezzo);
        }
      }

      // Relazioni (solo ID)
      if (valori.editore?.id) formData.append('editore_id', valori.editore.id);
      if (valori.collana?.id) formData.append('collana_id', valori.collana.id);

      // Chip → array di ID
      this.autoriSelezionati.forEach(autore => {
        formData.append('autori_copertina[]', autore.id);
      });
      this.storieSelezionate.forEach(storia => {
        formData.append('storie[]', storia.id);
      });

      // File copertina (solo se l'utente ha selezionato un nuovo file)
      if (this.fileCopertina) {
        formData.append('file_copertina', this.fileCopertina, this.fileCopertina.name);
      }

      if (this.isModifica) {
        // --- MODALITÀ MODIFICA ---
        // Laravel non accetta PUT con multipart/form-data, usiamo il workaround _method
        formData.append('_method', 'PUT');
        this.alboService.updateAlbo(this.data!.albo!.id, formData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (errore) => {
            console.error('Errore durante la modifica:', errore);
          }
        });
      } else {
        // --- MODALITÀ CREA ---
        this.alboService.creaAlbo(formData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (errore) => {
            console.error('Errore durante la creazione:', errore);
          }
        });
      }

    } else {
      this.alboForm.markAllAsTouched();
    }
  }
}