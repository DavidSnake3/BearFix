import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Usuario } from '../../models/UsuarioModel';
import { BaseAPI } from './base-apis';
import { CreateTecnicoRequest, UpdateTecnicoRequest } from '../../models/tecnico.model';

@Injectable({
  providedIn: 'root'
})
export class TecnicoService extends BaseAPI<Usuario> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointTecnico);
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

  createTecnico(tecnicoData: CreateTecnicoRequest) {
    return this.http.post<Usuario>(`${this.urlAPI}/${this.endpoint}`, tecnicoData);
  }

  updateTecnico(tecnicoData: UpdateTecnicoRequest) {
    return this.http.put<Usuario>(`${this.urlAPI}/${this.endpoint}/${tecnicoData.id}`, tecnicoData);
  }

  deleteTecnico(id: number) {
    return this.http.delete<any>(`${this.urlAPI}/${this.endpoint}/${id}`);
  }
}