import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardTotali {
  albi: number;
  storie: number;
  autori: number;
  albi_letti: number;
  albi_da_leggere: number;
}

export interface DashboardData {
  totali: DashboardTotali;
  albi_per_editore: { nome: string; totale: number }[];
  albi_per_anno: { anno: number; totale: number }[];
  storie_per_stato: { stato: string; totale: number }[];
  ultimi_albi: any[];
  ultimi_letti: any[];
  da_leggere: any[];
}

export interface DashboardResponse {
  success: boolean;
  dati: DashboardData;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/dashboard`);
  }
}
