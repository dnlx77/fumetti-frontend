import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, forkJoin } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import { StoriaService } from '../../../core/services/storia';
import { Storia, AutoreRuolo } from '../../../core/models/storia/storia';

export interface StoriaDialogData {
  storia?: Storia;
}

// Rappresenta una riga nella UI: autore scelto + ruolo scelto
interface RigaAutoreRuolo {
  autoreCtrl: FormControl;
  ruoloCtrl: FormControl;
  autoreFiltrati$: Observable<any[]>;
  ruoliFiltrati$: Observable<any[]>;
}

@Component({
  selector: 'app-storia-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './storia-form-dialog.html',
  styleUrl: './storia-form-dialog.scss'
})
export class StoriaFormDialog implements OnInit {
  storiaForm!: FormGroup;

  // Liste dizionari
  autoriList: any[] = [];
  ruoliList: any[] = [];

  // Righe della tabella autore+ruolo
  righeAutoriRuoli: RigaAutoreRuolo[] = [];

  // Valori fissi per il campo stato
  statiDisponibili = [
    { valore: 'in_corso',       etichetta: 'In Corso' },
    { valore: 'autoconclusiva', etichetta: 'Auto Conclusiva' },
    { valore: 'finita',         etichetta: 'Finita' },
];

  get isModifica(): boolean {
    return !!this.data?.storia;
  }

  constructor(
    private dialogRef: MatDialogRef<StoriaFormDialog>,
    private fb: FormBuilder,
    private storiaService: StoriaService,
    @Inject(MAT_DIALOG_DATA) public data: StoriaDialogData | null
  ) {}

  ngOnInit() {
    this.storiaForm = this.fb.group({
      nome: ['', Validators.required],
      trama: [''],
      stato: ['', Validators.required],
    });

    // Carichiamo autori e ruoli in parallelo
    forkJoin({
      autoriRes: this.storiaService.getAutori(),
      ruoliRes: this.storiaService.getRuoli(),
    }).subscribe({
      next: (risposte) => {
        this.autoriList = risposte.autoriRes.dati;
        this.ruoliList = risposte.ruoliRes.dati;

        // Se siamo in modifica, precompiliamo il form
        if (this.isModifica) {
          this.precompilaForm();
        }
      },
      error: (err) => console.error('Errore caricamento dizionari:', err)
    });
  }

  precompilaForm() {
    const storia = this.data!.storia!;

    this.storiaForm.patchValue({
        nome: storia.nome ?? '',
        trama: storia.trama ?? '',
        stato: storia.stato ?? '',
    });

    // Leggiamo gli autori con il ruolo_id dal pivot
    const autori = (storia as any).autori ?? [];
    autori.forEach((autore: any) => {
    const autoreOggetto = this.autoriList.find(a => a.id === autore.id) ?? null;
    const ruoloOggetto = this.ruoliList.find(r => r.id === autore.pivot?.ruolo_id) ?? null; // ← oggetto completo
    this.aggiungiRiga(autoreOggetto, ruoloOggetto);
});
}

  // Crea una nuova riga autore+ruolo, opzionalmente precompilata
  aggiungiRiga(autoreIniziale: any = null, ruoloIniziale: any = null) {
    const autoreCtrl = new FormControl(autoreIniziale);
    const ruoloCtrl = new FormControl(ruoloIniziale);

    const autoreFiltrati$ = autoreCtrl.valueChanges.pipe(
        startWith(autoreIniziale),
        map((value: any) => {
            const stringa = typeof value === 'string' ? value : value?.nome ?? '';
            return stringa
                ? this.autoriList.filter(a => a.nome.toLowerCase().includes(stringa.toLowerCase()))
                : this.autoriList.slice();
        })
    );

    const ruoliFiltrati$ = ruoloCtrl.valueChanges.pipe(
        startWith(''),
        map((value: any) => {
            const stringa = typeof value === 'string' ? value : value?.descrizione ?? '';
            return stringa
                ? this.ruoliList.filter(r => r.descrizione.toLowerCase().includes(stringa.toLowerCase()))
                : this.ruoliList.slice();
        })
    );

    this.righeAutoriRuoli.push({
        autoreCtrl,
        ruoloCtrl,
        autoreFiltrati$,
        ruoliFiltrati$,
    });
}

  rimuoviRiga(index: number) {
    this.righeAutoriRuoli.splice(index, 1);
  }

  mostraNome(item: any): string {
    return item && item.nome ? item.nome : '';
  }

  mostraDescrizione(item: any): string {
    return item && item.descrizione ? item.descrizione : '';
}

  chiudi() {
    this.dialogRef.close('annullato');
  }

  salva() {
    if (this.storiaForm.invalid) {
      this.storiaForm.markAllAsTouched();
      return;
    }

    const valori = this.storiaForm.value;

    // Costruiamo l'array autori_ruoli da inviare a Laravel
    // Filtriamo le righe incomplete (autore o ruolo non selezionati)
    const autoriRuoli = this.righeAutoriRuoli
    .filter(r => r.autoreCtrl.value?.id && r.ruoloCtrl.value?.id)
    .map(r => ({
        autore_id: r.autoreCtrl.value.id,
        ruolo_id: r.ruoloCtrl.value.id,
    }));

    const payload = {
      nome: valori.nome,
      trama: valori.trama || null,
      stato: valori.stato,
      autori_ruoli: autoriRuoli,
    };

    if (this.isModifica) {
      this.storiaService.updateStoria(this.data!.storia!.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Errore modifica storia:', err)
      });
    } else {
      this.storiaService.creaStoria(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Errore creazione storia:', err)
      });
    }
  }
}