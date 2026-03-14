import { Component } from '@angular/core';
import { GenericList, GenericListConfig } from '../../shared/generic-list/generic-list';

@Component({
  selector: 'app-editori',
  standalone: true,
  imports: [GenericList],
  template: `<app-generic-list [config]="config" />`
})
export class Editori {
  config: GenericListConfig = {
    titolo: 'Editori',
    endpoint: 'editori',
    campoTesto: 'nome',
    labelCampo: 'Nome',
    iconaTitolo: '🏢'
  };
}
