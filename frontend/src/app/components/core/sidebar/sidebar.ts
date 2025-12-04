import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../share/services/api/auth.service';
import { TranslocoService } from '@jsverse/transloco';
import { AvailableLanguage } from '../../../transloco-config';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  role = '';
  stats = { misTickets: 5 };

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.role = this.authService.getRoleFromToken();
  }
}