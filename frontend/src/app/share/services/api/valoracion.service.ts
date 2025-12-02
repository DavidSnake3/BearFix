import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from './auth.service';
import { Valoracion, CreateValoracionRequest, PromedioValoracionTecnico } from '../../models/ValoracionModel';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService {
  private urlAPI: string = environment.apiURL;
  private endpoint: string = 'valoraciones';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
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

  crearValoracion(valoracionData: CreateValoracionRequest): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.urlAPI}/${this.endpoint}`, valoracionData, { headers });
  }

  obtenerValoracionPorTicket(ticketId: number): Observable<Valoracion> {
    const headers = this.getHeaders();
    return this.http.get<Valoracion>(`${this.urlAPI}/${this.endpoint}/ticket/${ticketId}`, { headers });
  }

  obtenerValoracionesPorTecnico(tecnicoId: number): Observable<Valoracion[]> {
    const headers = this.getHeaders();
    return this.http.get<Valoracion[]>(`${this.urlAPI}/${this.endpoint}/tecnico/${tecnicoId}`, { headers });
  }

  obtenerPromedioValoracionesTecnico(tecnicoId: number): Observable<PromedioValoracionTecnico> {
    const headers = this.getHeaders();
    return this.http.get<PromedioValoracionTecnico>(`${this.urlAPI}/${this.endpoint}/tecnico/${tecnicoId}/promedio`, { headers });
  }

  obtenerTodasValoraciones(): Observable<Valoracion[]> {
    const headers = this.getHeaders();
    return this.http.get<Valoracion[]>(`${this.urlAPI}/${this.endpoint}/todas`, { headers });
  }
}