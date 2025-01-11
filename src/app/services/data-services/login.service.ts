import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  private loginTriggered = new Subject<void>();
  loginTriggered$ = this.loginTriggered.asObservable();

  triggerAction() {
    this.loginTriggered.next();
  }
}
