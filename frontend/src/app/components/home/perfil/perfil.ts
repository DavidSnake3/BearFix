import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioPerfil, PerfilService, ActualizarPerfilRequest } from '../../../share/services/api/perfil.service';
import { NotificationService } from '../../../share/services/app/notification.service';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  perfilForm: FormGroup;
  usuario: UsuarioPerfil | null = null;
  estaCargando = false;
  esEditando = false;
  correoOriginal = '';
  mostrarPassword = false; 

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private notificationService: NotificationService
  ) {
    this.perfilForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      telefono: ['', [
        Validators.pattern(/^[\+]?[0-9\s\-\(\)]{8,15}$/),
        Validators.minLength(8),
        Validators.maxLength(15)
      ]],
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]]
    });
  }

  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  cargarPerfil(): void {
    this.estaCargando = true;

    this.perfilService.obtenerPerfil().subscribe({
      next: (usuario: UsuarioPerfil) => {
        this.usuario = usuario;
        this.correoOriginal = usuario.correo;

        this.perfilForm.patchValue({
          nombre: usuario.nombre || '',
          telefono: usuario.telefono || '',
          correo: usuario.correo
        });

        this.estaCargando = false;
        this.perfilForm.disable();
        this.perfilForm.markAsPristine();
      },
      error: () => {
        this.notificationService.error('Error', 'No se pudo cargar la información del perfil');
        this.estaCargando = false;
      }
    });
  }

  habilitarEdicion(): void {
    this.esEditando = true;
    this.perfilForm.enable();
    this.perfilForm.markAsPristine();
  }

  cancelarEdicion(): void {
    this.esEditando = false;
    this.perfilForm.patchValue({
      nombre: this.usuario?.nombre || '',
      telefono: this.usuario?.telefono || '',
      correo: this.usuario?.correo || ''
    });
    this.perfilForm.disable();
    this.perfilForm.markAsPristine();
    this.perfilForm.markAsUntouched();
  }

  guardarCambios(): void { 


    console.log('🟢 [Perfil] guardarCambios() EJECUTADO - INICIO');
    console.log('📋 Formulario válido:', this.perfilForm.valid);
    
    this.marcarControlesComoTocados();
    
    if (this.perfilForm.invalid) {
      console.log('🔴 Formulario INVÁLIDO - No se enviará');
      this.mostrarErroresValidacion();
      return;
    }

    console.log('🟢 Formulario VÁLIDO - Continuando...');
    this.estaCargando = true;

    const datos: ActualizarPerfilRequest = {
      nombre: this.perfilForm.get('nombre')?.value?.trim() || null,
      telefono: this.perfilForm.get('telefono')?.value?.trim() || null,
      correo: this.perfilForm.get('correo')?.value?.trim()
    };

    console.log('📤 Datos preparados:', datos);

    this.perfilService.actualizarPerfil(datos).subscribe({
      next: (usuarioActualizado: UsuarioPerfil) => {
        console.log('✅ ÉXITO - Respuesta del servidor recibida');
        this.usuario = usuarioActualizado;
        this.esEditando = false;
        this.perfilForm.disable();
        this.perfilForm.markAsPristine();
        this.perfilForm.markAsUntouched();
        this.estaCargando = false;
        this.notificationService.success('Éxito', 'Perfil actualizado correctamente');
      },
      error: (error) => {
        console.error('❌ ERROR - En la petición:', error);
        this.estaCargando = false;
        if (error.status === 400 && error.error?.message) {
          this.notificationService.error('Error', error.error.message);
        } else {
          this.notificationService.error('Error', 'No se pudo actualizar el perfil');
        }
      }
    });
  }

  private mostrarErroresValidacion(): void {
    if (this.nombre?.errors?.['required']) {
      this.notificationService.warning('Advertencia', 'El nombre completo es requerido');
    } else if (this.nombre?.errors?.['minlength']) {
      this.notificationService.warning('Advertencia', 'El nombre debe tener al menos 2 caracteres');
    } else if (this.nombre?.errors?.['maxlength']) {
      this.notificationService.warning('Advertencia', 'El nombre no puede tener más de 50 caracteres');
    } else if (this.nombre?.errors?.['pattern']) {
      this.notificationService.warning('Advertencia', 'El nombre solo puede contener letras y espacios');
    } else if (this.correo?.errors?.['required']) {
      this.notificationService.warning('Advertencia', 'El correo electrónico es requerido');
    } else if (this.correo?.errors?.['email']) {
      this.notificationService.warning('Advertencia', 'El formato del correo electrónico es inválido');
    } else if (this.correo?.errors?.['maxlength']) {
      this.notificationService.warning('Advertencia', 'El correo no puede tener más de 100 caracteres');
    } else if (this.telefono?.errors?.['pattern']) {
      this.notificationService.warning('Advertencia', 'El formato del teléfono es inválido');
    } else if (this.telefono?.errors?.['minlength']) {
      this.notificationService.warning('Advertencia', 'El teléfono debe tener al menos 8 caracteres');
    } else if (this.telefono?.errors?.['maxlength']) {
      this.notificationService.warning('Advertencia', 'El teléfono no puede tener más de 15 caracteres');
    } else {
      this.notificationService.warning('Advertencia', 'Por favor complete correctamente todos los campos');
    }
  }

  private marcarControlesComoTocados(): void {
    Object.keys(this.perfilForm.controls).forEach(key => {
      const control = this.perfilForm.get(key);
      control?.markAsTouched();
    });
  }

  get nombre() { return this.perfilForm.get('nombre'); }
  get telefono() { return this.perfilForm.get('telefono'); }
  get correo() { return this.perfilForm.get('correo'); }

  obtenerTextoRol(rol: string | undefined): string {
    if (!rol) return 'Sin rol';
    const rolesMap: { [key: string]: string } = {
      'ADM': 'Administrador',
      'TEC': 'Técnico',
      'USR': 'Usuario'
    };
    return rolesMap[rol] || rol;
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'Nunca';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  get mostrarCamposTecnicos(): boolean {
    return this.usuario?.rol === 'TEC' || this.usuario?.rol === 'ADM';
  }
}