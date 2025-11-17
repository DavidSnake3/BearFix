import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Etiqueta } from '../../models/EtiquetaModel';
import { BaseAPI } from './base-apis';

export interface CreateEtiquetaRequest {
  nombre: string;
  descripcion?: string;
}

export interface UpdateEtiquetaRequest {
  id: number;
  nombre?: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EtiquetaService extends BaseAPI<Etiqueta> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointEtiqueta);
  }

  createEtiqueta(etiquetaData: CreateEtiquetaRequest): Observable<Etiqueta> {
    return this.http.post<Etiqueta>(`${this.urlAPI}/${this.endpoint}`, etiquetaData);
  }

  updateEtiqueta(etiquetaData: UpdateEtiquetaRequest): Observable<Etiqueta> {
    return this.http.put<Etiqueta>(`${this.urlAPI}/${this.endpoint}/${etiquetaData.id}`, etiquetaData);
  }

  deleteEtiqueta(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlAPI}/${this.endpoint}/${id}`);
  }
}