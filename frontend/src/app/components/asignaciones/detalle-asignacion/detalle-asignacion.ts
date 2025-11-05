import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsignacionService } from '../../../share/services/api/asignacion.service';
import { environment } from '../../../../environments/environment.development'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-detalle-asignacion',
  templateUrl: './detalle-asignacion.html',
  styleUrls: ['./detalle-asignacion.css'],
  standalone: false
})
export class DetalleAsignacionComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private asignacionService = inject(AsignacionService);

  asignacion = signal<any>(null);
  cargando = signal<boolean>(true);

  //Cargar imagenes igual que la profe, para que sepa Beto.
  private imageBaseUrl = environment.apiURL ?
    `${environment.apiURL}/images/` :
    'http://localhost:3000/images/';

  private defaultImage = 'image-not-found.jpg';

  selectedImage = signal<any>(null);
  showImageModal = signal(false);
  currentImageIndex = signal(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDetalleAsignacion(+id);
    }
  }

  cargarDetalleAsignacion(id: number): void {
    this.asignacionService.getAsignacionById(id).subscribe({
      next: (data) => {
        this.asignacion.set(data);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
      }
    });
  }

  getImageUrl(imageName: string): string {
    if (!imageName) {
      return `${this.imageBaseUrl}${this.defaultImage}`;
    }
    if (imageName.startsWith('http')) {
      return imageName;
    }
    return `${this.imageBaseUrl}${imageName}`;
  }

  handleImageError(event: any): void {
    event.target.src = `${this.imageBaseUrl}${this.defaultImage}`;
  }

  abrirImagenModal(imagen: any): void {
    const imagenes = this.asignacion()?.ticket?.imagenes || [];
    const index = imagenes.findIndex((img: any) => img.id === imagen.id);
    this.currentImageIndex.set(index);
    this.selectedImage.set(imagen);
    this.showImageModal.set(true);
  }

  cerrarImagenModal(): void {
    this.showImageModal.set(false);
    this.selectedImage.set(null);
    this.currentImageIndex.set(0);
  }

  navegarImagen(direction: 'prev' | 'next'): void {
    const imagenes = this.asignacion()?.ticket?.imagenes || [];
    let newIndex = this.currentImageIndex();

    if (direction === 'prev') {
      newIndex = (newIndex - 1 + imagenes.length) % imagenes.length;
    } else {
      newIndex = (newIndex + 1) % imagenes.length;
    }

    this.currentImageIndex.set(newIndex);
    this.selectedImage.set(imagenes[newIndex]);
  }

  abrirImagen(url: string): void {
    window.open(url, '_blank');
  }

  volverACalendario(): void {
    this.router.navigate(['/asignaciones']);
  }

  obtenerClasePrioridad(prioridad: string): string {
    switch (prioridad?.toUpperCase()) {
      case 'ALTO': return 'prioridad-alto';
      case 'MEDIO': return 'prioridad-medio';
      case 'BAJO': return 'prioridad-bajo';
      default: return 'prioridad-default';
    }
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ASIGNADO': return 'estado-asignado';
      case 'EN_PROCESO': return 'estado-en-proceso';
      case 'ESPERA_CLIENTE': return 'estado-espera-cliente';
      case 'RESUELTO': return 'estado-resuelto';
      case 'CERRADO': return 'estado-cerrado';
      default: return 'estado-asignado';
    }
  }

  esSLAVencido(fechaLimite: string): boolean {
    if (!fechaLimite) return false;
    return new Date(fechaLimite) < new Date();
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearFechaCompleta(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaRelativa(fecha: string): string {
    if (!fecha) return 'N/A';

    const now = new Date();
    const date = new Date(fecha);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoy';
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
    return `hace ${Math.floor(diffDays / 30)} meses`;
  }

  formatearTamanoArchivo(tamano: number): string {
    if (!tamano) return '0 MB';
    return (tamano / 1024 / 1024).toFixed(2) + ' MB';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-ES');
  }
}