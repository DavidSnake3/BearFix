import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt'
import { TokenApiModel } from '../../models/token-api.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl: string = 'http://localhost:3000/api/user/';
  private userPayload: any;

  constructor(private http: HttpClient, private router: Router) {
    this.userPayload = this.decodedToken();
  }

  signUp(userObj: any) {
    return this.http.post<any>(`${this.baseUrl}register`, userObj);
  }

  signIn(loginObj: any) {
    return this.http.post<any>(`${this.baseUrl}authenticate`, loginObj);
  }

  signOut() {
    console.log('Ejecutando signOut...');
    localStorage.clear();
    sessionStorage.clear();
    console.log('Redirigiendo a /auth/login');
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-id');
    localStorage.removeItem('user-name');
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue);
    this.userPayload = this.decodedToken();

    if (this.userPayload) {
      localStorage.setItem('user-role', this.userPayload.role || '');
      localStorage.setItem('user-id', this.userPayload.userId?.toString() || '');
      localStorage.setItem('user-name', this.userPayload.name || '');
    }
  }

  storeRefreshToken(tokenValue: string) {
    localStorage.setItem('refreshToken', tokenValue);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const jwtHelper = new JwtHelperService();
    return !jwtHelper.isTokenExpired(token);
  }

  decodedToken() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken();

    if (token && !jwtHelper.isTokenExpired(token)) {
      try {
        return jwtHelper.decodeToken(token);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getfullNameFromToken(): string {
    const storedName = localStorage.getItem('user-name');
    if (storedName) {
      return storedName;
    }

    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const name = decoded.name || decoded.email || 'Usuario';

        localStorage.setItem('user-name', name);
        return name;
      } catch (error) {
        console.error('Error decoding token for name:', error);
      }
    }
    return 'Usuario';
  }

  getRoleFromToken(): string {
    const storedRole = localStorage.getItem('user-role');
    if (storedRole) {
      return storedRole;
    }

    if (this.userPayload) {
      const role = this.userPayload.role || '';
      if (role) {
        localStorage.setItem('user-role', role);
      }
      return role;
    }

    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded.role || '';
        if (role) {
          localStorage.setItem('user-role', role);
        }
        return role;
      } catch (error) {
        console.error('Error decoding token for role:', error);
      }
    }

    return '';
  }

  getUserIdFromToken(): number {
    const storedId = localStorage.getItem('user-id');
    if (storedId) {
      return parseInt(storedId);
    }

    if (this.userPayload && this.userPayload.userId) {
      const userId = parseInt(this.userPayload.userId);
      localStorage.setItem('user-id', userId.toString());
      return userId;
    }

    const token = this.getToken();
    if (!token) return 0;

    try {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.userId || decodedToken.id || decodedToken.nameid || 0;
      if (userId) {
        localStorage.setItem('user-id', userId.toString());
      }
      return parseInt(userId);
    } catch (error) {
      console.error('Error decoding token for user ID:', error);
      return 0;
    }
  }

  renewToken(tokenApi: TokenApiModel) {
    return this.http.post<any>(`${this.baseUrl}refresh`, tokenApi);
  }

  isTokenExpired(): boolean {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken();
    if (!token) return true;
    return jwtHelper.isTokenExpired(token);
  }
}