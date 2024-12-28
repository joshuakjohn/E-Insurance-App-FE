import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HttpLoginService {

  constructor(public http: HttpClient) { }

  postApiCall<T>(endpoint: string, data: any){
    return this.http.post<T>('http://localhost:4000'+endpoint, data)
  }
}
