import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../share/services/api/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  fullName = 'Usuario';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fullName = this.authService.getfullNameFromToken();
    console.log('Nombre del usuario:', this.fullName);
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
}