import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { AuthService } from '../../../share/services/api/auth.service';
import { UserStoreService } from '../../../share/services/api/user-store.service';
import { TicketService } from '../../../share/services/api/ticket.service';
import { NotificationService } from '../../../share/services/app/notification.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: false
})
export class DashboardComponent {
  private notificationService = inject(NotificationService);
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private userStore = inject(UserStoreService);
  private router = inject(Router);
  private toast = inject(NgToastService);

  public role = signal<string>('');
  public fullName = signal<string>('Usuario');
  public userId = signal<number>(0);
  public isLoading = signal<boolean>(true);
  public recentTickets = signal<any[]>([]);
  public recentActivity = signal<any[]>([]);
  public stats = signal({ misTickets: 0 });

  private estadoMap: { [key: string]: { text: string, badgeClass: string, icon: string } } = {
    'PENDIENTE': { text: 'Pendiente', badgeClass: 'bg-warning', icon: 'bi-clock' },
    'EN_PROCESO': { text: 'En Proceso', badgeClass: 'bg-primary', icon: 'bi-gear' },
    'RESUELTO': { text: 'Resuelto', badgeClass: 'bg-success', icon: 'bi-check-circle' },
    'CERRADO': { text: 'Cerrado', badgeClass: 'bg-success', icon: 'bi-check-circle' },
    'ASIGNADO': { text: 'Asignado', badgeClass: 'bg-primary', icon: 'bi-person-check' },
    'ESPERA_CLIENTE': { text: 'Espera Cliente', badgeClass: 'bg-info', icon: 'bi-person' }
  };

  private prioridadMap: { [key: string]: { badgeClass: string, icon: string } } = {
    'CRITICO': { badgeClass: 'bg-danger', icon: 'bi-exclamation-triangle' },
    'ALTO': { badgeClass: 'bg-warning', icon: 'bi-exclamation-circle' },
    'MEDIO': { badgeClass: 'bg-info', icon: 'bi-info-circle' },
    'BAJO': { badgeClass: 'bg-success', icon: 'bi-arrow-down-circle' }
  };
  
  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.userStore.getFullNameFromStore()
      .subscribe((val: string | null) => {
        const fullNameFromToken = this.authService.getfullNameFromToken();
        this.fullName.set(val || fullNameFromToken || 'Usuario');
      });

    this.userStore.getRoleFromStore()
      .subscribe((val: string | null) => {
        const roleFromToken = this.authService.getRoleFromToken();
        this.role.set(val || roleFromToken || 'USR');
      });

    this.userId.set(this.authService.getUserIdFromToken());

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading.set(true);

    this.ticketService.getTicketsDashboard().subscribe({
      next: (res: any) => {
        
        if (res && res.success && Array.isArray(res.tickets)) {
          this.recentTickets.set(res.tickets);
          this.stats.set({ misTickets: res.total || res.tickets.length });
        } else {
          this.recentTickets.set([]);
          this.stats.set({ misTickets: 0 });
        }

        this.isLoading.set(false);
        this.updateRecentActivity();
      },
      error: (err) => {
        this.toast.danger('Error al cargar el dashboard', 'ERROR', 3000);
        this.isLoading.set(false);
        this.recentTickets.set([]);
        this.stats.set({ misTickets: 0 });
        this.updateRecentActivity();
      }
    });
  }

  verTicket(ticketId: number) {
    this.router.navigate(['/tickets/historial']);
  }

  nuevoTicket() {
    this.router.navigate(['/tickets-user']);
  }

  refreshData() {
    this.isLoading.set(true);
    this.loadDashboardData();
    this.toast.info('Actualizando datos del dashboard...', 'ACTUALIZANDO', 2000);
  }

  getEstadoBadgeClass(estado: string): string {
    if (!estado) return 'bg-secondary';
    const estadoUpper = estado.toUpperCase();
    return this.estadoMap[estadoUpper]?.badgeClass || 'bg-secondary';
  }

  getEstadoIcon(estado: string): string {
    if (!estado) return 'bi-question-circle';
    const estadoUpper = estado.toUpperCase();
    return this.estadoMap[estadoUpper]?.icon || 'bi-question-circle';
  }

  getEstadoText(estado: string): string {
    if (!estado) return estado;
    const estadoUpper = estado.toUpperCase();
    return this.estadoMap[estadoUpper]?.text || estado;
  }

  getPrioridadBadgeClass(prioridad: string): string {
    if (!prioridad) return 'bg-secondary';
    const prioridadUpper = prioridad.toUpperCase();
    return this.prioridadMap[prioridadUpper]?.badgeClass || 'bg-secondary';
  }

  getPriorityIcon(priority: string): string {
    if (!priority) return 'bi-circle';
    const priorityUpper = priority.toUpperCase();
    return this.prioridadMap[priorityUpper]?.icon || 'bi-circle';
  }

  updateRecentActivity() {
    const activity = [];

    if (this.recentTickets().length > 0) {
      this.recentTickets().slice(0, 3).forEach(ticket => {
        activity.push({
          icon: 'fas fa-ticket-alt',
          color: 'primary',
          text: `Ticket ${ticket.consecutivo || 'TKT-' + ticket.id} - ${ticket.titulo}`,
          time: this.formatTimeAgo(ticket.fechaCreacion)
        });
      });
    }

    activity.unshift({
      icon: 'fas fa-eye',
      color: 'success',
      text: 'Sistema cargado correctamente',
      time: 'Hace unos momentos'
    });

    this.recentActivity.set(activity);
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace unos momentos';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }
}