import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './share/services/api/auth.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AvailableLanguage } from './transloco-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  title = 'BearFix';
  showLayout = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.showLayout = !event.url.includes('/auth') && this.authService.isLoggedIn();
      });
  }

  ngOnInit() {
    this.showLayout = !this.router.url.includes('/auth') && this.authService.isLoggedIn();
  }
}