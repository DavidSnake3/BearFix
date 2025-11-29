import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment.development';


export interface ResultadoAutotriage {
  ticket: string;
  titulo: string;
  tecnico?: string;
  puntaje?: number;
  capacidadTecnico?: number;
  error?: string;
  exito: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AutotriageService {
  private baseURL: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService 
  ) {
    this.baseURL = environment.apiURL;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  ejecutarAutotriage(): Observable<any> {
    return this.http.post<any>(
      `${this.baseURL}/autotriage/ejecutar`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  obtenerEstadisticas(): Observable<any> {
    return this.http.get<any>(
      `${this.baseURL}/autotriage/estadisticas`, 
      { headers: this.getHeaders() }
    );
  }
}