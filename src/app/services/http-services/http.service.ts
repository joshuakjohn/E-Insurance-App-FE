import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(public http: HttpClient) { }

  postApiCall(endpoint: string, data: any){
    return this.http.post('http://localhost:4000'+endpoint, data)
  }

  getApiCall(endpoint: string, headers: HttpHeaders){
    return this.http.get('http://localhost:4000'+endpoint, { headers })
  }
}
