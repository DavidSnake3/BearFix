import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Especialidad } from '../../models/EspecialidadModel';
import { environment } from '../../../../environments/environment.development';
import { BaseAPI } from './base-apis';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService extends BaseAPI<Especialidad> {

  constructor(httpClient: HttpClient) { 
    super(
      httpClient,
      'especialidades');
  }
}