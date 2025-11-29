import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Especialidad } from '../../models/EspecialidadModel';
import { BaseAPI } from './base-apis';
import { AuthService } from './auth.service';

export interface CreateEspecialidadRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface UpdateEspecialidadRequest {
  id: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService extends BaseAPI<Especialidad> {
  constructor(httpClient: HttpClient, authService: AuthService) { 
    super(httpClient, environment.endPointespecialidad, authService);
  }

  createEspecialidad(especialidadData: CreateEspecialidadRequest): Observable<Especialidad> {
    return this.http.post<Especialidad>(`${this.urlAPI}/${this.endpoint}`, especialidadData);
  }

  updateEspecialidad(especialidadData: UpdateEspecialidadRequest): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.urlAPI}/${this.endpoint}/${especialidadData.id}`, especialidadData);
  }

  deleteEspecialidad(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlAPI}/${this.endpoint}/${id}`);
  }
}