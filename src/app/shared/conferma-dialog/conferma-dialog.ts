import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface ConfermaDialogData {
  titolo: string;
  messaggio: string;
  labelConferma?: string; // default: 'Elimina'
  labelAnnulla?: string;  // default: 'Annulla'
}

@Component({
  selector: 'app-conferma-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.titolo }}</h2>

    <mat-dialog-content>
      <p>{{ data.messaggio }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="annulla()">
        {{ data.labelAnnulla || 'Annulla' }}
      </button>
      <button mat-flat-button color="warn" (click)="conferma()">
        {{ data.labelConferma || 'Elimina' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content p {
      font-size: 15px;
      color: #444;
      margin: 0;
    }
  `]
})
export class ConfermaDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfermaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfermaDialogData
  ) {}

  annulla(): void {
    this.dialogRef.close(false);
  }

  conferma(): void {
    this.dialogRef.close(true);
  }
}