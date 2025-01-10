import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(public http: HttpClient) { }

  postApiCall(endpoint: string, data: any, headers: HttpHeaders) {
    return this.http.post('http://localhost:4000' + endpoint, data, { headers });
  }

  getAllPlan(endpoint: string){
    return this.http.get('http://localhost:4000'+ endpoint)
  }
 
}
