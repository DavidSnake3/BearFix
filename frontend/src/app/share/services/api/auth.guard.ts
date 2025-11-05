import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const userRole = this.auth.getRoleFromToken();
    
    if (Array.isArray(expectedRole)) {
      if (expectedRole.includes(userRole)) {
        return true;
      }
    } else {
      if (userRole === expectedRole) {
        return true;
      }
    }
    
    this.router.navigate(['/dashboard']);
    return false;
  }
}