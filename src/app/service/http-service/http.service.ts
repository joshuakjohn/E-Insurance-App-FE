import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(public http:HttpClient) { }
  getAllPlan(endpoint: string): Observable<any> {
    return this.http.get('http://localhost:4000'+endpoint);
}
getAllScheme(endpoint:string):Observable<any>{
  return this.http.get('http://localhost:4000'+endpoint)
}
getPlanById(endpoint:string):Observable<any>{
  return this.http.get('http://localhost:4000'+endpoint)
}
getSchemeById(endpoint:string):Observable<any>{
  return this.http.get('http://localhost:4000'+endpoint)
}
getCustomerById(endpoint:string,header:any):Observable<any>{
  return this.http.get('http://localhost:4000'+endpoint,header)
}
createPolicy(endpoint:string,data:any,headers:any):Observable<any>{
  console.log(data)
  return this.http.post('http://localhost:4000'+endpoint,data,headers)
}
getPolicyCustomer(endpoint:string,headers:any):Observable<any>{
  return this.http.get('http://localhost:4000'+endpoint,headers)
}
payPremium(endpoint:string,data:any,header:any):Observable<any>{
  console.log(data)
  return this.http.post('http://localhost:4000'+endpoint,data,header);
}
getSearchScheme(endpoint:string,params:any):Observable<any>{
  return this.http.get('http://localhost:4000'+endpoint,params)
}
getRefreshToken(endpoint:string):Observable<any>{
  return this.http.get('http://localhost:4000'+endpoint);
}
}
