import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment.development';

export interface BaseEntity {
  id?: number;
}

export const API_ENDPOINT = new InjectionToken<string>('ApiEndpoint');

@Injectable({
  providedIn: 'root',
})
export class BaseAPI<T extends BaseEntity> {
  protected urlAPI: string = environment.apiURL;

  constructor(
    protected http: HttpClient,
    @Inject(API_ENDPOINT) protected endpoint: string,
    protected authService: AuthService
  ) { }

  protected getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const userId = this.authService.getUserIdFromToken();
    const userRole = this.authService.getRoleFromToken();
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (userId) {
      headers = headers.set('user-id', userId.toString());
    }

    if (userRole) {
      headers = headers.set('user-role', userRole);
    }

    return headers;
  }

  get(): Observable<T[]> {
    const headers = this.getHeaders();
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}`, { headers });
  }

  getMethod(
    action: string,
    options: { [param: string]: unknown } = {}
  ): Observable<T | T[]> {
    const headers = this.getHeaders();
    return this.http.get<T[]>(
      `${this.urlAPI}/${this.endpoint}/${action}`,
      { ...options, headers }
    );
  }

  getById(id: number): Observable<T> {
    const headers = this.getHeaders();
    return this.http.get<T>(`${this.urlAPI}/${this.endpoint}/${id}`, { headers });
  }

  create(item: T): Observable<T> {
    const headers = this.getHeaders();
    return this.http.post<T>(`${this.urlAPI}/${this.endpoint}`, item, { headers });
  }

  update(item: T): Observable<T> {
    const headers = this.getHeaders();
    return this.http.put<T>(`${this.urlAPI}/${this.endpoint}/${item.id}`, item, { headers });
  }

  delete(item: T) {
    const headers = this.getHeaders();
    return this.http.delete<T>(`${this.urlAPI}/${this.endpoint}/${item.id}`, { headers });
  }
}