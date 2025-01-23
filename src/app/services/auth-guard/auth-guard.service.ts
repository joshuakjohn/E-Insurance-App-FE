import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = localStorage.getItem('authToken'); // Authentication check
    const role = localStorage.getItem('role');  // Role check

    // Check if user is authenticated
    if (!token) {
      this.router.navigate(['/']); // Redirect unauthenticated users
      return false;
    }

    // Check role permissions
    const allowedRoles = route.data['roles'] as Array<string>;    
    if (allowedRoles && !allowedRoles.includes(role!)) {
      this.router.navigate(['/']); // Redirect unauthorized users
      return false;
    }

    return true; // Grant access
  }
}
