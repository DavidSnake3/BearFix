import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Ticket } from '../../models/TicketModel';
import { BaseAPI } from './base-apis';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService extends BaseAPI<Ticket> {


  
  constructor(
    httpClient: HttpClient,
    private authService: AuthService 
  ) { 
    super(httpClient, environment.endPointTicket);
  }

  protected override getHeaders(): HttpHeaders {
    const userId = this.authService.getUserIdFromToken();
    const userRole = this.authService.getRoleFromToken();
    

    return new HttpHeaders({
      'user-id': userId?.toString() || '0',
      'user-role': userRole || 'USR'
    });
  }
 
  override get(filtros?: any): Observable<any> {
    const headers = this.getHeaders();
    let params = new HttpParams();
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params = params.set(key, filtros[key].toString());
        }
      });
    }

    return this.http.get<any>(`${this.urlAPI}/${this.endpoint}`, { 
      headers, 
      params 
    });
  }

  getMisTicketsCreados(filtros?: any): Observable<any> {
    const headers = this.getHeaders();
    let params = new HttpParams();

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params = params.set(key, filtros[key].toString());
        }
      });
    }

    return this.http.get<any>(
      `${this.urlAPI}/${this.endpoint}/mis-tickets`,
      { headers, params }
    );
  }

  getTicketsDashboard(): Observable<any> {
    const headers = this.getHeaders();
    
    
    return this.http.get<any>(
      `${this.urlAPI}/${this.endpoint}/dashboard`, 
      { headers }
    ).pipe(
      tap(response => {
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getAsignaciones(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.urlAPI}/${this.endpoint}/asignaciones/tablero`,
      { headers: this.getHeaders() }
    );
  }

  getAsignacionById(ticketId: number): Observable<any> {
    return this.http.get<any>(
      `${this.urlAPI}/${this.endpoint}/asignaciones/${ticketId}`,
      { headers: this.getHeaders() }
    );
  }

  crearValoracion(ticketId: number, puntuacion: number, comentario?: string): Observable<any> {
    return this.http.post<any>(
      `${this.urlAPI}/${this.endpoint}/tickets/${ticketId}/valoracion`,
      { ticketId, puntuacion, comentario },
      { headers: this.getHeaders() }
    );
  }
}