import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { HttpService } from '../http-service/http.service';
import {jwtDecode} from 'jwt-decode';
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

    if (token && this.isTokenExpired(token)) {
      return this.refreshToken().pipe(
        switchMap(newToken => {
          if (newToken) {
            request = this.addTokenToRequest(request, newToken);
            return next.handle(request);
          } else {
            this.handleLogout();
            return throwError(() => new Error('Session expired. Please log in again.'));
          }
        })
      );
    } else if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError(err => {
        if (err.status === 500 || err.status === 401) {
          return this.refreshToken().pipe(
            switchMap(newToken => {
              if (newToken) {
                request = this.addTokenToRequest(request, newToken);
                return next.handle(request);
              } else {
                this.handleLogout();
                return throwError(() => new Error('Session expired. Please log in again.'));
              }
            }),
            catchError(() => {
              this.handleLogout();
              return throwError(() => new Error('Session expired. Please log in again.'));
            })
          );
        }
        return throwError(() => err); // Pass other errors to the next handler
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isTokenExpired(token: string): boolean {
    const decodedToken: DecodedToken = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return decodedToken.exp <= now;
  }

  private refreshToken(): Observable<string | null> {
    if (this.isRefreshing) {
      // If a refresh token request is already in progress, return the same observable
      return this.refreshTokenInProgress$!;
    }
  
    this.isRefreshing = true;
    const token = localStorage.getItem('authToken');
  
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
  
      if (userId) {
        const role = localStorage.getItem('role');
        this.refreshTokenInProgress$ = this.httpService.getRefreshToken(`/api/v1/${role}/${userId}/refreshtoken`).pipe(
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
            return of(null); // Return null on error
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
  private handleLogout() {
    localStorage.clear();
    this.router.navigate(['/dashboard/plans']);
  }
}
