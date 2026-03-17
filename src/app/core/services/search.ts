import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SearchParams {
  q: string;
  campo: string;
  tipo: string;
  letto?: string;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private endpoint = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  cercaAlbi(params: SearchParams): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/albi`, { params: { ...params } });
  }

  cercaStorie(params: SearchParams): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/storie`, { params: { ...params } });
  }

  cercaAutori(params: SearchParams): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/autori`, { params: { ...params } });
  }
}
