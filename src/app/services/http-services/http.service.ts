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

  getApiCall(endpoint: string, headers: HttpHeaders, params?: any){
    return this.http.get('http://localhost:4000'+endpoint, { headers, params })
  }

  patchApiCall(endpoint: string, data: any){
    return this.http.patch('http://localhost:4000'+endpoint, data)
  }

  getAgentById(endpoint:string,header:any){
    return this.http.get('http://localhost:4000'+endpoint,header)
  }
  getAgentRegion(endpoint:string){
    return this.http.get('http://localhost:4000'+ endpoint);
  }
}
