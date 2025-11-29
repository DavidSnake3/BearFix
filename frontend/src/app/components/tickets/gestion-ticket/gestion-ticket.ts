import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


import { AsignacionService } from '../../../share/services/api/asignacion.service';
import { FileUploadService } from '../../../share/services/api/file-upload.service';
import { NotificationService } from '../../../share/services/app/notification.service';
import { AuthService } from '../../../share/services/api/auth.service';
import { environment } from '../../../../environments/environment.development';
import { CambioEstadoRequest, TicketStateService } from '../../../share/services/api/ticket-state.service';

@Component({
  selector: 'app-gestion-ticket',
  templateUrl: './gestion-ticket.html',
  styleUrls: ['./gestion-ticket.css'],
  standalone: false
})
export class GestionTicketComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ticketStateService = inject(TicketStateService);
  private asignacionService = inject(AsignacionService);
  private fileUploadService = inject(FileUploadService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  ticket = signal<any>(null);
  historial = signal<any[]>([]);
  isLoading = signal(false);
  estaSubiendoImagen = signal(false);
  imagenesEvidencia = signal<any[]>([]);
  showImageModal = signal(false);
  selectedImage = signal<any>(null);

  estadoForm: FormGroup;

  constructor() {
    this.estadoForm = this.fb.group({
      nuevoEstado: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const ticketId = this.route.snapshot.params['id'];
    this.cargarTicket(ticketId);
    this.cargarHistorial(ticketId);
  }

  cargarTicket(ticketId: number): void {
    this.isLoading.set(true);
    this.asignacionService.getAsignacionById(ticketId).subscribe({
      next: (data) => {
        this.ticket.set(data.ticket || data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando ticket:', error);
        this.notificationService.error('Error', 'No se pudo cargar el ticket', 4000);
        this.isLoading.set(false);
        this.router.navigate(['/asignaciones']);
      }
    });
  }

  cargarHistorial(ticketId: number): void {
    this.ticketStateService.obtenerHistorial(ticketId).subscribe({
      next: (response) => {
        if (response.success) {
          this.historial.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
      }
    });
  }

  cambiarEstado(): void {
    if (this.estadoForm.invalid) {
      this.marcarControlesComoTouched();
      return;
    }

    if (this.imagenesEvidencia().length === 0) {
      this.notificationService.warning('Validación', 'Se requiere al menos una imagen como evidencia', 4000);
      return;
    }

    this.isLoading.set(true);

    const request: CambioEstadoRequest = {
      nuevoEstado: this.estadoForm.value.nuevoEstado,
      observaciones: this.estadoForm.value.observaciones,
      imagenes: this.imagenesEvidencia()
    };

    this.ticketStateService.cambiarEstado(this.ticket()!.id, request).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Estado del ticket actualizado correctamente', 4000);
        this.estadoForm.reset();
        this.imagenesEvidencia.set([]);
        this.cargarTicket(this.ticket()!.id);
        this.cargarHistorial(this.ticket()!.id);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cambiando estado:', error);
        this.notificationService.error('Error', error.error?.message || 'No se pudo cambiar el estado', 4000);
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.subirImagenEvidencia(file);
      }
      event.target.value = '';
    }
  }

  subirImagenEvidencia(file: File): void {
    if (file.size > 2 * 1024 * 1024) {
      this.notificationService.warning('Archivo muy grande', 'La imagen no debe superar los 2MB', 4000);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.notificationService.warning('Tipo de archivo no válido', 'Solo se permiten imágenes JPEG, PNG, GIF y WebP', 4000);
      return;
    }

    this.estaSubiendoImagen.set(true);

    this.fileUploadService.upload(file, null).subscribe({
      next: (response) => {
        const nuevaImagen = {
          nombreArchivo: response.fileName,
          url: `${environment.apiURL}/images/${response.fileName}`,
          tipo: file.type,
          tamaño: file.size,
          descripcion: `Evidencia - ${new Date().toLocaleDateString()}`
        };

        this.imagenesEvidencia.update(imagenes => [...imagenes, nuevaImagen]);
        this.estaSubiendoImagen.set(false);
        this.notificationService.success('Éxito', 'Imagen subida correctamente', 3000);
      },
      error: (error) => {
        console.error('Error subiendo imagen:', error);
        this.estaSubiendoImagen.set(false);
        this.notificationService.error('Error', 'No se pudo subir la imagen', 4000);
      }
    });
  }

  eliminarImagenEvidencia(index: number): void {
    this.imagenesEvidencia.update(imagenes => 
      imagenes.filter((_, i) => i !== index)
    );
  }

  verImagen(imagen: any): void {
    this.selectedImage.set(imagen);
    this.showImageModal.set(true);
  }

  closeImageModal(): void {
    this.showImageModal.set(false);
    this.selectedImage.set(null);
  }

  getImageUrl(imageName: string): string {
    return `${environment.apiURL}/images/${imageName}`;
  }

  getTiempoRestanteSLA(): number {
    const ticketData = this.ticket();
    if (!ticketData?.fechaLimiteResolucion) return 0;
    
    const ahora = new Date();
    const fechaLimite = new Date(ticketData.fechaLimiteResolucion);
    const diffHoras = (fechaLimite.getTime() - ahora.getTime()) / (1000 * 3600);
    
    return Math.max(0, Math.round(diffHoras));
  }

  getEstadoBadgeClass(estado: string): string {
    if (!estado) return 'bg-secondary';
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'cerrado':
      case 'resuelto':
        return 'bg-success';
      case 'en_proceso':
      case 'asignado':
        return 'bg-primary';
      case 'pendiente':
        return 'bg-warning';
      case 'espera_cliente':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getPrioridadBadgeClass(prioridad: string): string {
    if (!prioridad) return 'bg-secondary';
    const prioridadLower = prioridad.toLowerCase();
    switch (prioridadLower) {
      case 'critico':
        return 'bg-danger';
      case 'alto':
        return 'bg-warning';
      case 'medio':
        return 'bg-info';
      case 'bajo':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  private marcarControlesComoTouched(): void {
    Object.keys(this.estadoForm.controls).forEach(key => {
      this.estadoForm.get(key)?.markAsTouched();
    });
  }
}