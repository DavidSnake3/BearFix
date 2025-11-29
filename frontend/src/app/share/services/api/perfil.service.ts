import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { BaseAPI } from './base-apis'; 
import { AuthService } from './auth.service'; 

export interface ActualizarPerfilRequest {
  nombre?: string | null;
  telefono?: string | null;
  correo?: string | null;
}

export interface UsuarioPerfil {
  id: number;
  correo: string;
  nombre?: string;
  telefono?: string;
  rol: string;
  activo: boolean;
  disponible?: boolean;
  cargosActuales?: number;
  limiteCargaTickets?: number;
  ultimoInicio?: string;
  ultimaActualizacion?: string;
  creadoEn: string;
  actualizadoEn: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService extends BaseAPI<UsuarioPerfil> { 
  constructor(
    http: HttpClient, 
    authService: AuthService 
  ) { 
    super(http, environment.endPointUsuario, authService);
  }

  obtenerPerfil(): Observable<UsuarioPerfil> {
    const headers = this.getHeaders();
    const url = `${this.urlAPI}/${this.endpoint}/perfil`;
    
    return this.http.get<UsuarioPerfil>(url, { headers });
  }

  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<UsuarioPerfil> {
    const headers = this.getHeaders();
    const url = `${this.urlAPI}/${this.endpoint}/actualizar`;
    

    
    return this.http.post<UsuarioPerfil>(url, datos, { headers });
  }

  verificarCorreoUnico(correo: string): Observable<{ disponible: boolean }> {
    const headers = this.getHeaders();
    const url = `${this.urlAPI}/${this.endpoint}/verificar-correo/${correo}`;
    return this.http.get<{ disponible: boolean }>(url, { headers });
  }
}