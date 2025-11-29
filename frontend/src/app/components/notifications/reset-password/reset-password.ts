// reset-password.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ResetPasswordService, ResetPasswordRequest } from '../../../share/services/api/reset-password.service';
import { NotificationService } from '../../../share/services/app/notification.service';
import ValidateForm from '../../../helpers/validationform';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  standalone: false,
})
export class ResetPasswordComponent implements OnInit {
  isLoading = signal<boolean>(false);
  isTokenValid = signal<boolean>(false);
  tokenVerified = signal<boolean>(false);
  
  type = signal<string>('password');
  confirmType = signal<string>('password');
  isText = signal<boolean>(false);
  isConfirmText = signal<boolean>(false);
  eyeIcon = signal<string>('bi-eye-slash');
  confirmEyeIcon = signal<string>('bi-eye-slash');

  resetForm!: FormGroup;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private resetService = inject(ResetPasswordService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });

    this.verifyResetToken();
  }

  private verifyResetToken() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const token = params['code'];

      if (!email || !token) {
        this.notificationService.error(
          'Enlace inválido',
          'El enlace de recuperación es inválido o ha expirado',
          5000
        );
        this.router.navigate(['/auth/login']);
        return;
      }

      this.isLoading.set(true);
      
      setTimeout(() => {
        this.isTokenValid.set(true);
        this.tokenVerified.set(true);
        this.isLoading.set(false);
      }, 1000);
    });
  }

  passwordStrengthValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;

    return valid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) return null;

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  hideShowPass(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.isText.update(value => !value);
      this.eyeIcon.set(this.isText() ? 'bi-eye' : 'bi-eye-slash');
      this.type.set(this.isText() ? 'text' : 'password');
    } else {
      this.isConfirmText.update(value => !value);
      this.confirmEyeIcon.set(this.isConfirmText() ? 'bi-eye' : 'bi-eye-slash');
      this.confirmType.set(this.isConfirmText() ? 'text' : 'password');
    }
  }

  getPasswordStrengthMessage(): string {
    const password = this.resetForm.get('newPassword')?.value;
    
    if (!password) return '';

    const requirements = [
      { test: /.{8,}/, message: 'Mínimo 8 caracteres' },
      { test: /[A-Z]/, message: 'Una mayúscula' },
      { test: /[a-z]/, message: 'Una minúscula' },
      { test: /\d/, message: 'Un número' },
      { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, message: 'Un carácter especial' }
    ];

    const met = requirements.filter(req => req.test.test(password)).length;
    const total = requirements.length;

    return `Fortaleza de la contraseña: ${met}/${total} requisitos`;
  }

  onSubmit() {
    if (this.resetForm.valid && this.isTokenValid()) {
      this.isLoading.set(true);

      const { newPassword, confirmPassword } = this.resetForm.value;
      const email = this.route.snapshot.queryParams['email'];
      const token = this.route.snapshot.queryParams['code'];


      const resetData: ResetPasswordRequest = {
        correo: email,
        emailToken: token,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };


      this.resetService.resetPassword(resetData).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          console.log('✅ Respuesta exitosa:', res);
          
          this.notificationService.success(
            '¡Contraseña actualizada!',
            'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
            5000
          );

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1000);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          
          let errorMessage = 'Error al restablecer la contraseña';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 400) {
            errorMessage = 'El enlace de recuperación es inválido o ha expirado';
          } else if (err.status === 404) {
            errorMessage = 'Usuario no encontrado';
          }

          this.notificationService.error('Error', errorMessage, 5000);
        }
      });
    } else {
      ValidateForm.validateAllFormFields(this.resetForm);
    }
  }

  getPasswordStrengthClass(): string {
    const password = this.resetForm.get('newPassword')?.value;
    if (!password) return '';

    const requirements = [
      /.{8,}/, /[A-Z]/, /[a-z]/, /\d/, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    ];

    const met = requirements.filter(req => req.test(password)).length;
    const total = requirements.length;
    const percentage = (met / total) * 100;

    if (percentage <= 40) return 'weak';
    if (percentage <= 70) return 'medium';
    return 'strong';
  }
}