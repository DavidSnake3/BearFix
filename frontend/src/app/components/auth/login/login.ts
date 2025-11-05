import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../share/services/api/auth.service';
import { ResetPasswordService } from '../../../share/services/api/reset-password.service';
import { UserStoreService } from '../../../share/services/api/user-store.service';
import { NotificationService } from '../../../share/services/app/notification.service';
import ValidateForm from '../../../helpers/validationform';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  
  type = signal<string>('password');
  isText = signal<boolean>(false);
  eyeIcon = signal<string>('bi-eye-slash');
  resetPasswordEmail = signal<string>('');
  isValidEmail = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  loginForm!: FormGroup;
  
  features = [
    { icon: 'bi bi-ticket-perforated', text: 'Gestión eficiente de tickets' },
    { icon: 'bi bi-graph-up', text: 'Seguimiento en tiempo real' },
    { icon: 'bi bi-shield-check', text: 'Plataforma segura' },
    { icon: 'bi bi-headset', text: 'Soporte 24/7' }
  ];

  stats = [
    { value: '10K+', label: 'Tickets Resueltos' },
    { value: '500+', label: 'Clientes Satisfechos' }
  ];

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private userStore = inject(UserStoreService);
  private resetService = inject(ResetPasswordService);

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  hideShowPass() {
    this.isText.update(value => !value);
    this.eyeIcon.set(this.isText() ? 'bi-eye' : 'bi-eye-slash');
    this.type.set(this.isText() ? 'text' : 'password');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      
      const loginData = {
        correo: this.loginForm.value.username,
        contrasena: this.loginForm.value.password
      };


      this.auth.signIn(loginData).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.loginForm.reset();
          this.auth.storeToken(res.accessToken);
          this.auth.storeRefreshToken(res.refreshToken);

          const tokenPayload = this.auth.decodedToken();
          console.log('Token decodificado:', tokenPayload);

          const userName = tokenPayload?.name || tokenPayload?.email || 'Usuario';
          const userRole = tokenPayload?.role || '';
          const userId = tokenPayload?.userId || '';

          localStorage.setItem('user-name', userName);
          localStorage.setItem('user-role', userRole);
          localStorage.setItem('user-id', userId.toString());

          this.userStore.setFullNameForStore(userName);
          this.userStore.setRoleForStore(userRole);

          // CORRECCIÓN: Pasar solo la duración como número
          this.notificationService.success('¡Bienvenido!', `Hola ${userName}`, 3000);

          this.redirectByRole(userRole);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          console.error('Error completo:', err);
          
          let errorMessage = 'Error al iniciar sesión';
          let errorTitle = 'Error de autenticación';

          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 404) {
            errorTitle = 'Usuario no encontrado';
            errorMessage = 'No existe una cuenta con este correo electrónico';
          } else if (err.status === 400 || err.status === 401) {
            errorTitle = 'Credenciales incorrectas';
            errorMessage = 'El correo o contraseña son incorrectos';
          } else if (err.status === 0) {
            errorTitle = 'Error de conexión';
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
          }

          // CORRECCIÓN: Pasar solo la duración como número
          this.notificationService.error(errorTitle, errorMessage, 5000);
        },
      });
    } else {
      ValidateForm.validateAllFormFields(this.loginForm);
   
      this.notificationService.warning(
        'Formulario incompleto', 
        'Por favor completa todos los campos requeridos correctamente',
        4000
      );
    }
  }

  redirectByRole(role: string) {
    const routes: { [key: string]: string } = {
      'ADM': '/dashboard',
      'TEC': '/asignaciones',
      'USR': '/tickets/mis-tickets'
    };

    this.router.navigate([routes[role] || '/dashboard']);
  }

  checkValidEmail(event: string) {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
    this.isValidEmail.set(pattern.test(event));
    this.resetPasswordEmail.set(event);
  }

  confirmToSend() {
    const email = this.resetPasswordEmail();

    if (!email) {
      this.notificationService.warning(
        'Email requerido', 
        'Por favor ingresa tu dirección de correo electrónico',
        4000
      );
      return;
    }

    if (!this.isValidEmail()) {
      this.notificationService.warning(
        'Email inválido', 
        'Por favor ingresa una dirección de correo electrónico válida',
        4000
      );
      return;
    }


    this.resetService.sendResetPasswordLink(email).subscribe({
      next: (res: any) => {
        console.log('Respuesta del servidor:', res);
        
        this.notificationService.success(
          'Enlace enviado', 
          'Se ha enviado un enlace de recuperación a tu correo electrónico',
          5000
        );
        
        this.resetPasswordEmail.set('');
        this.cerrarModal();
      },
      error: (err: any) => {
        console.error('Error en reset password:', err);
        
        let errorMessage = 'Error al enviar el enlace de recuperación';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 404) {
          errorMessage = 'No existe una cuenta con este correo electrónico';
        } else if (err.status === 500) {
          errorMessage = 'Error del servidor, por favor intenta más tarde';
        }

        this.notificationService.error('Error', errorMessage, 5000);
      }
    });
  }

  private cerrarModal() {
    const closeBtn = document.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
    if (closeBtn) {
      closeBtn.click();
    }
  }
}