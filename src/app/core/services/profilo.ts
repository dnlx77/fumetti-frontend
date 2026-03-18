import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfiloService {
  private endpoint = `${environment.apiUrl}/profilo`;

  constructor(private http: HttpClient) {}

  getProfilo(): Observable<any> {
    return this.http.get<any>(this.endpoint);
  }

  cambiaPassword(dati: {
    password_attuale: string;
    nuova_password: string;
    nuova_password_confirmation: string;
  }): Observable<any> {
    return this.http.put<any>(`${this.endpoint}/password`, dati);
  }
}
