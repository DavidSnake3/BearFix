import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, Notificacion } from '../../../share/services/api/notification.service';
import { NotificationService as AppNotificationService } from '../../../share/services/app/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);
  private appNotificationService = inject(AppNotificationService);

  notificaciones = signal<Notificacion[]>([]);
  noLeidasCount = signal<number>(0);
  isLoading = signal<boolean>(true);
  mostrarSoloNoLeidas = signal<boolean>(false);

  paginacion = signal({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });

  ngOnInit(): void {
    this.cargarNotificaciones();
    this.contarNoLeidas();
  }

  cargarNotificaciones(): void {
    this.isLoading.set(true);
    
    this.notificationService.obtenerNotificaciones(
      this.mostrarSoloNoLeidas() ? false : undefined,
      this.paginacion().currentPage,
      this.paginacion().itemsPerPage
    ).subscribe({
      next: (response) => {
        this.notificaciones.set(response.notificaciones);
        this.paginacion.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando notificaciones', error);
        this.appNotificationService.error('Error', 'No se pudieron cargar las notificaciones', 4000);
        this.isLoading.set(false);
      }
    });
  }

  contarNoLeidas(): void {
    this.notificationService.contarNoLeidas().subscribe({
      next: (response) => {
        this.noLeidasCount.set(response.count);
      },
      error: (error) => {
        console.error('Error contando no leídas', error);
      }
    });
  }

  marcarComoLeida(notificacion: Notificacion): void {
    this.notificationService.marcarComoLeida(notificacion.id).subscribe({
      next: () => {
        notificacion.leida = true;
        this.contarNoLeidas();
        this.appNotificationService.success('Éxito', 'Notificación marcada como leída', 3000);
      },
      error: (error) => {
        console.error('Error marcando como leída', error);
        this.appNotificationService.error('Error', 'No se pudo marcar como leída', 4000);
      }
    });
  }

  marcarTodasComoLeidas(): void {
    this.notificationService.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.notificaciones().forEach(n => n.leida = true);
        this.noLeidasCount.set(0);
        this.appNotificationService.success('Éxito', 'Todas las notificaciones marcadas como leídas', 3000);
      },
      error: (error) => {
        console.error('Error marcando todas como leídas', error);
        this.appNotificationService.error('Error', 'No se pudieron marcar todas como leídas', 4000);
      }
    });
  }

  toggleFiltro(): void {
    this.mostrarSoloNoLeidas.set(!this.mostrarSoloNoLeidas());
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.cargarNotificaciones();
  }

  cambiarPagina(pagina: number): void {
    this.paginacion.update(p => ({ ...p, currentPage: pagina }));
    this.cargarNotificaciones();
  }

  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'ASIGNACION_TICKET': return 'bg-primary';
      case 'CAMBIO_ESTADO': return 'bg-info';
      case 'VENCIMIENTO': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTipoTexto(tipo: string): string {
    switch (tipo) {
      case 'ASIGNACION_TICKET': return 'Asignación';
      case 'CAMBIO_ESTADO': return 'Cambio de Estado';
      case 'VENCIMIENTO': return 'Vencimiento';
      default: return 'Notificación';
    }
  }
}