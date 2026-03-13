import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Albo, ApiResponse } from '../models/albo';

@Injectable({
  providedIn: 'root'
})
export class AlboService {
  // Supponiamo che la tua rotta su Laravel sia /api/v1/albo
  private endpoint = `${environment.apiUrl}`; 

  constructor(private http: HttpClient) { }

  // Metodo per recuperare la lista degli albi, con supporto alla paginazione
  getAlbi(page: number = 1): Observable<ApiResponse<Albo>> {
    return this.http.get<ApiResponse<Albo>>(`${this.endpoint}/albi?page=${page}`);
  }
  
  creaAlbo(datiForm: FormData): Observable<any> {
    return this.http.post(`${this.endpoint}/albi`, datiForm);
  }
  // METODI PER POPOLARE IL FORM
  getEditori(): Observable<any> {
    return this.http.get(`${this.endpoint}/editori/lista`);
  }

  getCollane(): Observable<any> {
    return this.http.get(`${this.endpoint}/collane/lista`);
  }

  getAutori(): Observable<any> {
    return this.http.get(`${this.endpoint}/autori/lista`);
  }

  getStorie(): Observable<any> {
    return this.http.get(`${this.endpoint}/storie/lista`);
  }
}