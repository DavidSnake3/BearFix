import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment.development';

export interface TecnicoDisponible {
  id: number;
  nombre: string;
  correo: string;
  especialidades: any[];
  cargaActual: number;
  limiteCarga: number;
  disponible: boolean;
  telefono?: string;
}

export interface TicketPendiente {
  id: number;
  consecutivo: string;
  titulo: string;
  descripcion: string;
  categoria: any;
  prioridad: string;
  fechaCreacion: string;
  solicitante: {
    id: number;
    nombre: string;
    correo: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AsignacionManualService {
  private baseURL: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.baseURL = environment.apiURL;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (!token) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerTicketsPendientes(): Observable<{success: boolean, data: TicketPendiente[]}> {
    return this.http.get<{success: boolean, data: TicketPendiente[]}>(
      `${this.baseURL}/asignacion-manual/tickets-pendientes`, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        return of({
          success: false,
          data: []
        });
      })
    );
  }

  obtenerTecnicosDisponibles(): Observable<{success: boolean, data: TecnicoDisponible[]}> {
    return this.http.get<{success: boolean, data: TecnicoDisponible[]}>(
      `${this.baseURL}/asignacion-manual/tecnicos-disponibles`, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        return of({
          success: false,
          data: []
        });
      })
    );
  }

  asignarManual(ticketId: number, tecnicoId: number, justificacion: string): Observable<any> {
    const body = {
      ticketId,
      tecnicoId,
      justificacion
    };

    return this.http.post<any>(
      `${this.baseURL}/asignacion-manual/asignar`,
      body,
      { headers: this.getHeaders() }
    );
  }
}