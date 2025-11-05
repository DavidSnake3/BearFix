import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';

@Component({
  selector: 'app-page-not-found',
  standalone: false,
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css'
})
export class PageNotFound {
  constructor(private router: Router,private authService: AuthService) { }
irInicio(): void {
    const token = this.authService.getToken();
    const isLoggedIn = !!token; 
    
    if (isLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

}
