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

  getAlbi(page: number = 1): Observable<ApiResponse<Albo>> {
    return this.http.get<ApiResponse<Albo>>(`${this.endpoint}?page=${page}`);
  }

  // Recupera il dettaglio completo di un singolo albo
  getAlbo(id: number): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/${id}`);
  }

  creaAlbo(formData: FormData): Observable<any> {
    return this.http.post(this.endpoint, formData);
  }

  updateAlbo(id: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.endpoint}/${id}`, formData);
  }

  deleteAlbo(id: number): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }

  getEditori(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/editori/lista`);
  }

  getCollane(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/collane/lista`);
  }

  getAutori(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/autori/lista`);
  }

  getStorie(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/storie/lista`);
  }
}
