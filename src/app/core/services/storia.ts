import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StoriaApiResponse } from '../models/storia/storia';

@Injectable({
  providedIn: 'root'
})
export class StoriaService {
  private endpoint = `${environment.apiUrl}/storie`;

  constructor(private http: HttpClient) {}

  // Lista paginata
  getStorie(page: number = 1, ordinaPer: string = 'nome', direzione: string = 'asc'): Observable<StoriaApiResponse> {
    return this.http.get<StoriaApiResponse>(`${this.endpoint}?page=${page}&ordina_per=${ordinaPer}&direzione=${direzione}`);
  }

  // Dettaglio singola storia
  getStoria(id: number): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/${id}`);
  }

  // Crea una nuova storia
  creaStoria(dati: any): Observable<any> {
    return this.http.post(this.endpoint, dati);
  }

  // Aggiorna una storia esistente
  updateStoria(id: number, dati: any): Observable<any> {
    return this.http.put(`${this.endpoint}/${id}`, dati);
  }

  // Elimina una storia
  deleteStoria(id: number): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }

  // Lista completa autori (per autocomplete)
  getAutori(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/autori/lista`);
  }

  // Lista completa ruoli (per select)
  getRuoli(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/ruoli/lista`);
  }
}