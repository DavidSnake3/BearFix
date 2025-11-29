
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private baseURL: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) { 
    this.baseURL = environment.apiURL; 
  }
  
  private getHeaders(): HttpHeaders {
    if (!this.authService) {
      return new HttpHeaders();
    }

    const userId = this.authService.getUserIdFromToken();
    const userRole = this.authService.getRoleFromToken();
    
    const userIdString = typeof userId === 'number' ? userId.toString() : (userId || '0');

    const headers = new HttpHeaders({
      'user-id': userIdString,
      'user-role': userRole || 'USR',
      'Content-Type': 'application/json'
    });

    return headers;
  }
  getMisAsignaciones(): Observable<any[]> {
    const url = `${this.baseURL}/tickets/asignaciones/mis-asignaciones`;
    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      tap(data => console.log(' Mis asignaciones recibidas:', data)),
      catchError(error => {
       
        throw error;
      })
    );
  }

  getTodasAsignaciones(): Observable<any[]> {
    const url = `${this.baseURL}/tickets/asignaciones/todas`;
    
    return this.http.get<any[]>(url, { headers: this.getHeaders() }).pipe(
      tap(data => console.log(' Todas las asignaciones recibidas:', data)),
      catchError(error => {
        console.error(' Error cargando todas las asignaciones:', error);
        throw error;
      })
    );
  }

  getTodasAsignacionesConFiltros(filtros: any = {}): Observable<any> {
    const url = `${this.baseURL}/tickets/asignaciones/todas-con-filtros`;
    
    const params = new URLSearchParams();
    
    if (filtros.page) params.append('page', filtros.page.toString());
    if (filtros.limit) params.append('limit', filtros.limit.toString());
    if (filtros.search) params.append('search', filtros.search);
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
    if (filtros.sortBy) params.append('sortBy', filtros.sortBy);
    if (filtros.sortOrder) params.append('sortOrder', filtros.sortOrder);
    
    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    
    
    return this.http.get<any>(fullUrl, { headers: this.getHeaders() }).pipe(
      tap(data => console.log('RESPUESTA EXITOSA:', data)),
      catchError(error => {
        throw error;
      })
    );
  }

  getAsignacionById(ticketId: number): Observable<any> {
    const url = `${this.baseURL}/tickets/asignaciones/admin/${ticketId}`;
    
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      tap(data => console.log(' Detalle de asignación recibido:', data)),
      catchError(error => {
        console.error(' Error en getAsignacionById:', error);
        throw error;
      })
    );
  }


}