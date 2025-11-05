import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Categoria } from '../../models/CategoriaModel';
import { BaseAPI } from './base-apis';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService extends BaseAPI<Categoria> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointCategoria);
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
}

