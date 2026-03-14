import { Component } from '@angular/core';
import { GenericList, GenericListConfig } from '../../shared/generic-list/generic-list';

@Component({
  selector: 'app-collane',
  standalone: true,
  imports: [GenericList],
  template: `<app-generic-list [config]="config" />`
})
export class Collane {
  config: GenericListConfig = {
    titolo: 'Collane',
    endpoint: 'collane',
    campoTesto: 'nome',
    labelCampo: 'Nome',
    iconaTitolo: '🏷️'
  };
}
