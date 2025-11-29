import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment.development';


export interface CambioEstadoRequest {
  nuevoEstado: string;
  observaciones: string;
  imagenes: { nombreArchivo: string; url: string; tipo?: string; tamaño?: number; descripcion?: string }[];
}

export interface HistorialItem {
  id: number;
  estadoOrigen: string;
  estadoDestino: string;
  observaciones: string;
  creadoEn: string;
  usuario: { nombre: string; correo: string };
  imagenes: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TicketStateService {
  private baseURL: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.baseURL = environment.apiURL;
  }

  private getHeaders(): HttpHeaders {
    const userId = this.authService.getUserIdFromToken();
    const userRole = this.authService.getRoleFromToken();

    return new HttpHeaders({
      'user-id': userId?.toString() || '0',
      'user-role': userRole || 'USR',
      'Content-Type': 'application/json'
    });
  }

  cambiarEstado(ticketId: number, request: CambioEstadoRequest): Observable<any> {
    return this.http.put<any>(
      `${this.baseURL}/tickets/${ticketId}/estado`, 
      request, 
      { headers: this.getHeaders() }
    );
  }

  obtenerHistorial(ticketId: number): Observable<{success: boolean, data: HistorialItem[]}> {
    return this.http.get<{success: boolean, data: HistorialItem[]}>(
      `${this.baseURL}/tickets/${ticketId}/historial`, 
      { headers: this.getHeaders() }
    );
  }

  cancelarTicket(ticketId: number, observaciones: string): Observable<any> {
    const request: CambioEstadoRequest = {
      nuevoEstado: 'CANCELADO',
      observaciones,
      imagenes: [] // Para cancelación de usuario, no requerimos imágenes
    };

    return this.cambiarEstado(ticketId, request);
  }
}