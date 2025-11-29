// reset-password.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface ResetPasswordRequest {
  correo: string;
  emailToken: string;
  newPassword: string;
  confirmPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiURL;

  sendResetPasswordLink(correo: string): Observable<any> {
    const url = `${this.baseUrl}/api/user/send-reset-email/${correo}`;
    console.log('🔍 Enviando solicitud a:', url);
    
    return this.http.post(url, {}).pipe(
      tap({
        next: (response) => console.log('✅ Respuesta del servidor:', response),
        error: (error) => console.error('❌ Error en la solicitud:', error)
      })
    );
  }

  resetPassword(resetData: ResetPasswordRequest): Observable<any> {
    const url = `${this.baseUrl}/api/user/reset-password`;
    console.log('🔍 Enviando reset a:', url);
    
    return this.http.post(url, resetData).pipe(
      tap({
        next: (response) => console.log('✅ Contraseña restablecida:', response),
        error: (error) => console.error('❌ Error al restablecer:', error)
      })
    );
  }

  validateResetToken(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/user/validate-reset-token`, {
      correo,
      emailToken: token
    });
  }
}