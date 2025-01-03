import { Component, OnInit } from '@angular/core';
import { HttpService } from './service/http-service/http.service';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  email: string;
  exp: number; 
  iat: number; 
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'E-Insurance-App-FE';

  constructor(private httpService: HttpService) {}

  ngOnInit() {
    this.scheduleTokenRefresh();
  }

  scheduleTokenRefresh() {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token);
      console.log('Decoded Token:', decodedToken); 
  
      const userId = decodedToken.userId; 
  
      if (userId) {
       
        const expiryTime = decodedToken.exp * 1000; 
        const currentTime = Date.now();
        const refreshTime = expiryTime - currentTime; 
        const refreshBefore = refreshTime - 60000; 
  
  
        // Schedule the token refresh
        setTimeout(() => {
          this.refreshToken(userId);
        }, refreshBefore );
      } else {
        console.error('User ID not found in token');
      }
    } else {
      console.error('No token found in localStorage');
    }
  }
  
  
  refreshToken(userId: string) {
    console.log('Refreshing token for User ID:', userId);
    this.httpService.getRefreshToken(`/api/v1/customer/${userId}/refreshtoken`).subscribe({
      next: (res: any) => {
        localStorage.setItem('authToken', res.token);
        this.scheduleTokenRefresh(); 
      },
      error: (err) => {
        console.error('Failed to refresh token:', err);
      }
    });
  }
}
