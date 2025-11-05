import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Usuario, CreateUsuarioDto } from '../../models/UsuarioModel';
import { BaseAPI } from './base-apis';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends BaseAPI<Usuario> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointUsuario);
  }

  authenticate(correo: string, contrasena: string): Observable<{ accessToken: string, refreshToken: string }> {
    return this.http.post<{ accessToken: string, refreshToken: string }>(
      `${this.urlAPI}/${this.endpoint}/authenticate`,
      { correo, contrasena }
    );
  }

  register(userData: CreateUsuarioDto): Observable<any> {
    return this.http.post<any>(
      `${this.urlAPI}/${this.endpoint}/register`,
      userData
    );
  }

  refreshTokens(accessToken: string, refreshToken: string): Observable<{ accessToken: string, refreshToken: string }> {
    return this.http.post<{ accessToken: string, refreshToken: string }>(
      `${this.urlAPI}/${this.endpoint}/refresh`,
      { accessToken, refreshToken }
    );
  }

  sendResetEmail(correo: string): Observable<any> {
    return this.http.post<any>(
      `${this.urlAPI}/${this.endpoint}/send-reset-email/${correo}`,
      {}
    );
  }

  resetPassword(correo: string, emailToken: string, newPassword: string): Observable<any> {
    return this.http.post<any>(
      `${this.urlAPI}/${this.endpoint}/reset-password`,
      { correo, emailToken, newPassword }
    );
  }
}