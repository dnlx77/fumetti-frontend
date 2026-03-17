import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticheService {
  private endpoint = `${environment.apiUrl}/statistiche`;

  constructor(private http: HttpClient) {}

  getStatistiche(): Observable<any> {
    return this.http.get<any>(this.endpoint);
  }

  getHeatmapAlbi(da: string, a: string): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/heatmap-albi?da=${da}&a=${a}`);
  }

  getHeatmapStorie(da: string, a: string): Observable<any> {
    return this.http.get<any>(`${this.endpoint}/heatmap-storie?da=${da}&a=${a}`);
  }
}
