import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lettura {
  id: number;
  data_lettura: string;
  albo_id?: number;
  storia_id?: number;
}

export interface LettureResponse {
  success: boolean;
  dati: Lettura[];
}

@Injectable({
  providedIn: 'root'
})
export class LetturaService {

  constructor(private http: HttpClient) {}

  // --- ALBI ---
  getLettureAlbo(alboId: number): Observable<LettureResponse> {
    return this.http.get<LettureResponse>(`${environment.apiUrl}/albi/${alboId}/letture`);
  }

  addLetturaAlbo(alboId: number, dataLettura: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/albi/${alboId}/letture`, {
      data_lettura: dataLettura
    });
  }

  deleteLetturaAlbo(alboId: number, dataLettura: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/albi/${alboId}/letture/${dataLettura}`);
}

  // --- STORIE ---
  getLettureStoria(storiaId: number): Observable<LettureResponse> {
    return this.http.get<LettureResponse>(`${environment.apiUrl}/storie/${storiaId}/letture`);
  }

  addLetturaStoria(storiaId: number, dataLettura: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/storie/${storiaId}/letture`, {
      data_lettura: dataLettura
    });
  }

  deleteLetturaStoria(storiaId: number, dataLettura: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/storie/${storiaId}/letture/${dataLettura}`);
}
}
