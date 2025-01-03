import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpService } from '../http-service/http.service';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  email: string;
  exp: number; 
  iat: number; 
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private httpService: HttpService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('authToken');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError(err => {
           if (err.status === 500 || err.status === 401) {
          return this.refreshToken().pipe(
            switchMap(newToken => {
              if (newToken) {
                const newRequest = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next.handle(newRequest);
              } else {
               
                return of(err); 
              }
            })
          );
        }
        return of(err);
      })
    );
  }

  // Function to refresh the token
  private refreshToken() {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token); 
      const userId = decodedToken.userId;

      if (userId) {
        return this.httpService.getRefreshToken(`/api/v1/customer/${userId}/refreshtoken`).pipe(
          switchMap((res: any) => {
            localStorage.setItem('authToken', res.token);
            return of(res.newAccessToken);
          })
        );
      } else {
        console.error('User ID missing from decoded token');
        return of(null); 
      }
    }
    return of(null);
  }
}
