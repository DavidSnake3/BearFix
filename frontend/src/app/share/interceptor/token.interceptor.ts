import { TokenApiModel } from '../models/token-api.model';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from '../services/api/auth.service';
import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { NotificationService } from '../services/app/notification.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService, private toast: NgToastService, private router: Router) { }
  private notificationService = inject(NotificationService);
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const myToken = this.auth.getToken();

    if (myToken) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${myToken}` }
      });
    }

    return next.handle(request).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            return this.handleUnAuthorizedError(request, next);
          }
        }
        return throwError(() => err);
      })
    );
  }

  handleUnAuthorizedError(req: HttpRequest<any>, next: HttpHandler) {
    let tokeApiModel = new TokenApiModel();
    tokeApiModel.accessToken = this.auth.getToken()!;
    tokeApiModel.refreshToken = this.auth.getRefreshToken()!;
    return this.auth.renewToken(tokeApiModel)
      .pipe(
        switchMap((data: TokenApiModel) => {
          this.auth.storeRefreshToken(data.refreshToken);
          this.auth.storeToken(data.accessToken);
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${data.accessToken}` }
          });
          return next.handle(req);
        }),
        catchError((err) => {

                  this.notificationService.warning(
        'Token Expirado', 
        'Por favor auntenticarse denuevo',
        1000
      );
          this.router.navigate(['/']);

          return throwError(() => err);
        })
      );
  }
}
