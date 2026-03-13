import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Albo, ApiResponse } from '../models/albo';

@Injectable({
  providedIn: 'root'
})
export class AlboService {
  private endpoint = `${environment.apiUrl}/albi`;

  constructor(private http: HttpClient) { }

  // Recupera la lista paginata degli albi
  getAlbi(page: number = 1): Observable<ApiResponse<Albo>> {
    return this.http.get<ApiResponse<Albo>>(`${this.endpoint}?page=${page}`);
  }

  // Crea un nuovo albo
  creaAlbo(formData: FormData): Observable<any> {
    return this.http.post(this.endpoint, formData);
  }

  // Aggiorna un albo esistente.
  // NOTA: Laravel non accetta PUT con multipart/form-data (necessario per i file).
  // Il workaround standard è POST + _method=PUT, che va aggiunto nel FormData
  // prima di chiamare questo metodo (già gestito in albo-form-dialog.ts).
  updateAlbo(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.endpoint}/${id}`, formData);
  }

  // Elimina un albo
  deleteAlbo(id: number): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }

  // Recupera la lista degli editori (per il form)
  getEditori(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/editori/lista`);
  }

  // Recupera la lista delle collane (per il form)
  getCollane(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/collane/lista`);
  }

  // Recupera la lista degli autori (per il form)
  getAutori(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/autori/lista`);
  }

  // Recupera la lista delle storie (per il form)
  getStorie(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/storie/lista`);
  }
}