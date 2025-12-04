import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../share/services/api/auth.service';
import { NotificationService } from '../../../share/services/api/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { AvailableLanguage } from '../../../transloco-config';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private transloco = inject(TranslocoService);
  public languages: {code: AvailableLanguage, name: string}[] = [
    { code: AvailableLanguage.ES, name: 'languages.es' },
    { code: AvailableLanguage.EN, name: 'languages.en' },
  ]
  public changeLanguage(lang: AvailableLanguage) {
    this.transloco.setActiveLang(lang);
  }
  public getLanguage(){
    return this.transloco.getActiveLang();
  }

  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  fullName = 'Usuario';
  noLeidasCount = signal<number>(0);

  ngOnInit() {
    this.fullName = this.authService.getfullNameFromToken();
    this.cargarContadorNotificaciones();
  }

  cargarContadorNotificaciones(): void {
    this.notificationService.contarNoLeidas().subscribe({
      next: (response) => {
        this.noLeidasCount.set(response.count);
      },
      error: (error) => {
      }
    });
  }

  marcarTodasComoLeidas(): void {
    this.notificationService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.noLeidasCount.set(0);
      },
      error: (error) => {
      }
    });
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
}