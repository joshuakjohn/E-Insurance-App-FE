import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpService } from '../../services/http-services/http.service'
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface DecodedToken {
  userId: string;
  email: string;
  exp: number; // Expiration time (Unix timestamp in seconds)
  iat: number; // Issued at time
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenInProgress$: Observable<string> | null = null;

  constructor(private httpService: HttpService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('authToken');
  
    // Check if token is not null before proceeding
    if (token && !this.isTokenExpired(token)) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError(err => {
        // If token has expired or 401 error occurs, attempt to refresh the token
        if (err.status === 401 && token && this.isTokenExpired(token)) {
          console.warn('Token expired, attempting to refresh...');
          return this.refreshToken().pipe(
            switchMap(newToken => {
              if (newToken) {
                request = this.addTokenToRequest(request, newToken);
              }
              return next.handle(request);
            }),
            catchError(refreshErr => {
              console.error('Token refresh failed:', refreshErr);
              if (refreshErr.status === 500) {
                console.error('Server error while refreshing token');
                // Optionally, redirect to login page or handle the error appropriately
                this.router.navigate(['/login']);
              }
              return throwError(() => refreshErr); // Continue with the error
            })
          );
        }

        // Handle 500 errors and other errors separately
        if (err.status === 500) {
          console.warn('Server error occurred:', err.message);
          return throwError(() => err); // Continue with the error
        }

        // Handle 404 errors (if needed)
        if (err.status === 404) {
          console.warn('Not found error:', err.message);
          return throwError(() => err); // Continue with the error
        }

        // Handle any other errors
        console.error('Unhandled error occurred:', err.message);
        return throwError(() => err); // Continue with the error
      })
    );
  }

  private isTokenExpired(token: string): boolean {
    const decodedToken: DecodedToken = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return decodedToken.exp <= now;
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private refreshToken(): Observable<string | null> {
    if (this.isRefreshing) {
      return this.refreshTokenInProgress$!;
    }

    this.isRefreshing = true;
    const token = localStorage.getItem('authToken');

    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      if (userId) {
        const role = localStorage.getItem('role');
        this.refreshTokenInProgress$ = this.httpService.getApiCall(`pi/v1/${role}/${userId}/refreshtoken`).pipe(
          tap((res: any) => {
            this.isRefreshing = false;
            this.refreshTokenInProgress$ = null;
            if (res.token) {
              localStorage.setItem('authToken', res.token);
            }
          }),
          catchError(err => {
            this.isRefreshing = false;
            this.refreshTokenInProgress$ = null;
            console.error('Error refreshing token:', err);
            return of(null); // Return null to proceed without token refresh
          }),
          switchMap((res: any) => (res?.token ? of(res.token) : of(null)))
        );

        return this.refreshTokenInProgress$;
      }
    }

    this.isRefreshing = false;
    this.refreshTokenInProgress$ = null;
    return of(null);
  }
}
