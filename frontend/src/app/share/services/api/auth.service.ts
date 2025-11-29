import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { TokenApiModel } from '../../models/token-api.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl: string = 'http://localhost:3000/api/user/';

  constructor(private http: HttpClient, private router: Router) {}

  signUp(userObj: any) {
    return this.http.post<any>(`${this.baseUrl}register`, userObj);
  }

  signIn(loginObj: any) {
    return this.http.post<any>(`${this.baseUrl}authenticate`, loginObj);
  }

  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  storeToken(tokenValue: string) {
    localStorage.setItem('token', tokenValue);
  }

  storeRefreshToken(tokenValue: string) {
    localStorage.setItem('refreshToken', tokenValue);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getfullNameFromToken(): string {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.name || decoded.email || 'Usuario';
      } catch (error) {
        return 'Usuario';
      }
    }
    return 'Usuario';
  }

  getRoleFromToken(): string {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.role || '';
      } catch (error) {
        return '';
      }
    }
    return '';
  }

  getUserIdFromToken(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const decoded: any = jwtDecode(token);


      
      const userId = decoded.userId || decoded.id || decoded.nameid || 0;

      
      return parseInt(userId.toString());
    } catch (error) {
      console.error('Error decodificando token:', error);
      return 0;
    }
  }

  renewToken(tokenApi: TokenApiModel) {
    return this.http.post<any>(`${this.baseUrl}refresh`, tokenApi);
  }

  decodedToken(): any {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  
}