
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from '../../../share/services/api/auth.service';
import ValidateForm from '../../../helpers/validationform';
import { NotificationService } from '../../../share/services/app/notification.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  standalone: false
})
export class SignupComponent implements OnInit {

  public signUpForm!: FormGroup;
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";
  private notificationService = inject(NotificationService);
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: NgToastService
  ) { }

  ngOnInit() {
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = 'fa-eye' : this.eyeIcon = 'fa-eye-slash';
    this.isText ? this.type = 'text' : this.type = 'password';
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      const signUpObj = {
        correo: this.signUpForm.value.email,
        contrasena: this.signUpForm.value.password,
        nombre: `${this.signUpForm.value.firstName} ${this.signUpForm.value.lastName}`,
        telefono: this.signUpForm.value.telefono

      };


      this.auth.signUp(signUpObj)
        .subscribe({
          next: (res) => {
            console.log('Respuesta del servidor:', res);
            this.signUpForm.reset();
            this.notificationService.warning(
              'EXITO',
              res.message || 'Usuario creado exitosamente',
              5000
            );
            this.router.navigate(['/auth/login']);
          },
          error: (err) => {
            console.error('Error en registro:', err);
            let errorMessage = 'Error al crear usuario';

            if (err.error?.message) {
              errorMessage = err.error.message;
            } else if (err.status === 400) {
              errorMessage = 'El correo ya está registrado o los datos son inválidos';
            } else if (err.status === 0) {
              errorMessage = 'No se pudo conectar con el servidor';
            }
            this.notificationService.warning(
              'ERROR',
              errorMessage,
              5000
            );
          }
        });
    } else {
      ValidateForm.validateAllFormFields(this.signUpForm);
      this.notificationService.warning(
        'Formulario incompleto',
        'Por favor complete todos los campos requeridos correctamente',
        4000
      );
    }
  }
}