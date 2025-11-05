import { AuthService } from '../share/services/api/auth.service';
import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { NotificationService } from '../share/services/app/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private toast: NgToastService) {
  
  }
  private notificationService = inject(NotificationService);
  canActivate(): boolean {
    if (this.auth.isLoggedIn()) {
      return true
    } else {
        this.notificationService.warning(
        'Token Expirado', 
        'Por favor auntenticarse denuevo',
        6000
      );
      this.router.navigate(['/'])
      return false;
    }
  }

}
