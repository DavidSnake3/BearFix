import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

export interface BaseEntity {
  id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BaseAPI<T extends BaseEntity> {

  protected urlAPI: string = environment.apiURL;

  constructor(
    protected http: HttpClient,
    @Inject(String) protected endpoint: string
  ) { }

  protected getHeaders(): HttpHeaders | { [header: string]: string | string[] } {
    return {};
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