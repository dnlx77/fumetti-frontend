import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AutoreApiResponse } from '../models/autore';

@Injectable({
  providedIn: 'root'
})
export class AutoreService {
  private endpoint = `${environment.apiUrl}/autori`;

  constructor(private http: HttpClient) {}

  getAutori(page: number = 1, ordinaPer: string = 'cognome', direzione: string = 'asc'): Observable<AutoreApiResponse> {
    return this.http.get<AutoreApiResponse>(`${this.endpoint}?page=${page}&ordina_per=${ordinaPer}&direzione=${direzione}`);
  }

  getAutore(id: number): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/${id}`);
  }

  creaAutore(dati: any): Observable<any> {
    return this.http.post(this.endpoint, dati);
  }

  updateAutore(id: number, dati: any): Observable<any> {
    return this.http.put(`${this.endpoint}/${id}`, dati);
  }

  deleteAutore(id: number): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
}
