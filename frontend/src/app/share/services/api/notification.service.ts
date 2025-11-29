import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment.development';

export interface Notificacion {
  id: number;
  tipo: string;
  asunto?: string;
  mensaje?: string;
  leida: boolean;
  creadoEn: string;
  remitente?: { nombre: string; correo: string };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseURL: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.baseURL = environment.apiURL;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const userId = this.authService.getUserIdFromToken();
    const userRole = this.authService.getRoleFromToken();
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (userId) {
      headers = headers.set('user-id', userId.toString());
    }

    if (userRole) {
      headers = headers.set('user-role', userRole);
    }

    return headers;
  }

  obtenerNotificaciones(leidas?: boolean, page?: number, limit?: number): Observable<any> {
    let params = new HttpParams();
    
    if (leidas !== undefined) {
      params = params.set('leidas', leidas.toString());
    }
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<any>(`${this.baseURL}/notificaciones`, { 
      headers: this.getHeaders(), 
      params 
    });
  }

  marcarComoLeida(notificacionId: number): Observable<Notificacion> {
    return this.http.put<Notificacion>(
      `${this.baseURL}/notificaciones/${notificacionId}/leida`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  marcarTodasComoLeidas(): Observable<any> {
    return this.http.put<any>(
      `${this.baseURL}/notificaciones/marcar-todas-leidas`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  contarNoLeidas(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.baseURL}/notificaciones/contar-no-leidas`, 
      { headers: this.getHeaders() }
    );
  }
}