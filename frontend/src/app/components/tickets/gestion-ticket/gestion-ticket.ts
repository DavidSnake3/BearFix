import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AsignacionService } from '../../../share/services/api/asignacion.service';
import { TicketService } from '../../../share/services/api/ticket.service'; // AÑADIR ESTE SERVICIO
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
  private ticketService = inject(TicketService); 
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

  // AÑADIR SEÑAL PARA ID TICKET
  ticketId = signal<number | null>(null);

  estadoForm: FormGroup;

  constructor() {
    this.estadoForm = this.fb.group({
      nuevoEstado: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const asignacionId = this.route.snapshot.params['id'];
    console.log('Cargando gestión para asignación ID:', asignacionId);
    this.cargarTicketPorAsignacion(asignacionId);
  }

  // CAMBIAR: Cargar ticket por ID de asignación para obtener el ID del ticket
  cargarTicketPorAsignacion(asignacionId: number): void {
    this.isLoading.set(true);
    this.asignacionService.getAsignacionByAsignacionId(asignacionId).subscribe({
      next: (data) => {
        console.log('Datos de asignación recibidos:', data);
        
        if (data && data.ticket) {
          this.ticket.set(data.ticket);
          this.ticketId.set(data.ticket.id); // GUARDAR EL ID DEL TICKET
          
          // Ahora cargar el historial usando el ID del ticket
          if (data.ticket.id) {
            this.cargarHistorial(data.ticket.id);
          }
        } else {
          this.ticket.set(data);
          if (data.id) {
            this.ticketId.set(data.id);
            this.cargarHistorial(data.id);
          }
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando asignación:', error);
        this.notificationService.error('Error', 'No se pudo cargar la asignación', 4000);
        this.isLoading.set(false);
        this.router.navigate(['/asignaciones']);
      }
    });
  }

  // MODIFICAR: Cargar historial por ID de ticket
  cargarHistorial(ticketId: number): void {
    console.log('Cargando historial para ticket ID:', ticketId);
    this.ticketStateService.obtenerHistorial(ticketId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Historial recibido:', response.data);
          this.historial.set(response.data);
        } else {
          console.warn('Respuesta del historial no exitosa:', response);
          this.historial.set([]);
        }
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.notificationService.error('Error', 'No se pudo cargar el historial', 4000);
        this.historial.set([]);
      }
    });
  }

  // MODIFICAR: Cambiar estado usando ID del ticket
  cambiarEstado(): void {
    if (this.estadoForm.invalid) {
      this.marcarControlesComoTouched();
      return;
    }

    if (this.imagenesEvidencia().length === 0) {
      this.notificationService.warning('Validación', 'Se requiere al menos una imagen como evidencia', 4000);
      return;
    }

    const ticketId = this.ticketId();
    if (!ticketId) {
      this.notificationService.error('Error', 'No se pudo identificar el ticket', 4000);
      return;
    }

    this.isLoading.set(true);

    const request: CambioEstadoRequest = {
      nuevoEstado: this.estadoForm.value.nuevoEstado,
      observaciones: this.estadoForm.value.observaciones,
      imagenes: this.imagenesEvidencia()
    };

    console.log('Cambiando estado del ticket ID:', ticketId, 'Request:', request);

    this.ticketStateService.cambiarEstado(ticketId, request).subscribe({
      next: (response) => {
        this.notificationService.success('Éxito', 'Estado del ticket actualizado correctamente', 4000);
        this.estadoForm.reset();
        this.imagenesEvidencia.set([]);
        
        // Recargar los datos
        const asignacionId = this.route.snapshot.params['id'];
        this.cargarTicketPorAsignacion(asignacionId);
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cambiando estado:', error);
        this.notificationService.error('Error', error.error?.message || 'No se pudo cambiar el estado', 4000);
        this.isLoading.set(false);
      }
    });
  }

  // El resto de los métodos se mantienen igual...
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