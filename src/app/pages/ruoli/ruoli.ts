import { Component } from '@angular/core';
import { GenericList, GenericListConfig } from '../../shared/generic-list/generic-list';

@Component({
  selector: 'app-ruoli',
  standalone: true,
  imports: [GenericList],
  template: `<app-generic-list [config]="config" />`
})
export class Ruoli {
  config: GenericListConfig = {
    titolo: 'Ruoli',
    endpoint: 'ruoli',
    campoTesto: 'descrizione',
    labelCampo: 'Descrizione',
    iconaTitolo: '🎭'
  };
}
