import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GenericApiResponse {
  success: boolean;
  dati: {
    data: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GenericService {

  constructor(private http: HttpClient) {}

  getAll(endpoint: string, page: number = 1): Observable<GenericApiResponse> {
    return this.http.get<GenericApiResponse>(`${environment.apiUrl}/${endpoint}?page=${page}`);
  }

  create(endpoint: string, dati: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/${endpoint}`, dati);
  }

  update(endpoint: string, id: number, dati: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/${endpoint}/${id}`, dati);
  }

  delete(endpoint: string, id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/${endpoint}/${id}`);
  }
}
