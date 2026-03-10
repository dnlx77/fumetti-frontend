import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ECCO IL SIGNAL! Una variabile "reattiva" che parte da false.
  // Se diventa true, tutta l'app lo saprà all'istante senza ricaricare la pagina.
  isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient) {
    // Quando l'app si accende, controlliamo se avevamo già salvato un token in passato
    if (localStorage.getItem('auth_token')) {
      this.isLoggedIn.set(true);
    }
  }

  // Funzione che chiama l'API di Laravel
  login(credentials: {email: string, password: string}) {
    // Facciamo una POST a http://fumetti-api.locale.it/api/v1/login
    return this.http.post(`${environment.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Se Laravel risponde "Ok", salviamo il Token nel browser (nella cassaforte locale)
        localStorage.setItem('auth_token', response.token);
        
        // Aggiorniamo il Signal a "true"! Siamo loggati!
        this.isLoggedIn.set(true);
      })
    );
  }

  // Nuova funzione per la registrazione
  register(userData: any) {
    // Facciamo una POST a /register passando i dati del form
    return this.http.post(`${environment.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        // Se Laravel ci registra e ci dà subito un token, lo salviamo e entriamo!
        localStorage.setItem('auth_token', response.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    // 1. Chiamiamo l'API di Laravel per incenerire il token nel database
    return this.http.post(`${environment.apiUrl}/logout`, {}).pipe(
      tap(() => {
        // 2. Solo DOPO che Laravel ha confermato, puliamo la nostra "cassaforte" locale
        localStorage.removeItem('auth_token');
        this.isLoggedIn.set(false);
      })
    );
  }
}