import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CategoriaConEtiquetas, CreateTicketRequest, Etiqueta, Ticket, UpdateTicketRequest, Usuario } from '../../models/TicketModel';
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

  eliminarImagen(ticketId: number, imagenId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(
      `${this.urlAPI}/${this.endpoint}/${ticketId}/imagenes/${imagenId}`,
      { headers }
    );
  }

  getEtiquetasByCategoria(categoriaId: number): Observable<{success: boolean, categoria: any, etiquetas: Etiqueta[]}> {
    const headers = this.getHeaders();
    return this.http.get<{success: boolean, categoria: any, etiquetas: Etiqueta[]}>(
      `${this.urlAPI}/categorias/${categoriaId}/etiquetas`,
      { headers }
    );
  }

  createTicket(ticketData: CreateTicketRequest): Observable<Ticket> {
    const headers = this.getHeaders();
    return this.http.post<Ticket>(`${this.urlAPI}/${this.endpoint}`, ticketData, { headers });
  }

  updateTicket(ticketData: UpdateTicketRequest): Observable<Ticket> {
    const headers = this.getHeaders();
    return this.http.put<Ticket>(`${this.urlAPI}/${this.endpoint}/${ticketData.id}`, ticketData, { headers });
  }

  deleteTicket(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.urlAPI}/${this.endpoint}/${id}`, { headers });
  }

  getPrioridades(): Observable<string[]> {
    const headers = this.getHeaders();
    return this.http.get<string[]>(`${this.urlAPI}/${this.endpoint}/prioridades`, { headers });
  }

  getUsuarios(): Observable<Usuario[]> {
    const headers = this.getHeaders();
    return this.http.get<Usuario[]>(`${this.urlAPI}/${this.endpoint}/usuarios`, { headers });
  }

  getCategoriasConEtiquetas(): Observable<CategoriaConEtiquetas[]> {
    const headers = this.getHeaders();
    return this.http.get<CategoriaConEtiquetas[]>(`${this.urlAPI}/${this.endpoint}/categorias-con-etiquetas`, { headers });
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