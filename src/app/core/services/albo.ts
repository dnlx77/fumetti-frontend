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
  private endpoint = `${environment.apiUrl}/albi`; 

  constructor(private http: HttpClient) { }

  // Metodo per recuperare la lista degli albi, con supporto alla paginazione
  getAlbi(page: number = 1): Observable<ApiResponse<Albo>> {
    return this.http.get<ApiResponse<Albo>>(`${this.endpoint}?page=${page}`);
  }
}