import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Apriamo il cassetto (localStorage) e prendiamo il Pass VIP
  const token = localStorage.getItem('auth_token');

  // 2. Se abbiamo il token, modifichiamo la "busta" della richiesta
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Appiccichiamo il timbro magico!
      }
    });
    // Mandiamo avanti la richiesta modificata
    return next(clonedRequest);
  }

  // 3. Se NON abbiamo il token (es. stiamo facendo il login), mandiamo la busta normale
  return next(req);
};