import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AuthService } from '../../../share/services/api/auth.service';
import { TicketService } from '../../../share/services/api/ticket.service';
import { environment } from '../../../../environments/environment.development';
import { TicketStateService } from '../../../share/services/api/ticket-state.service';
import { NotificationService } from '../../../share/services/app/notification.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.html',
  styleUrls: ['./historial.css'],
  standalone: false,
})
export class HistorialComponent implements OnInit, OnDestroy {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
   private ticketStateService = inject(TicketStateService); // INYECTADO
  private notificationService = inject(NotificationService); // INYECTADO
  private destroy$ = new Subject<void>();

  tickets = signal<any[]>([]);
  isLoading = signal(true);
  selectedTicket = signal<any>(null);
  showModal = signal(false);
  isEditing = signal(false);
  

  filtros = signal({
    search: '',
    estado: '',
    prioridad: '',
    sortBy: 'fechaCreacion',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  paginacion = signal({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 5,
    hasNextPage: false,
    hasPrevPage: false
  });

  searchInput = signal<string>('');
  private searchSubject = new Subject<string>();

  estados = signal<string[]>(['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE', 'RESUELTO', 'CERRADO']);
  prioridades = signal<string[]>(['BAJO', 'MEDIO', 'ALTO', 'CRITICO']);
  selectedImage = signal<any>(null);
  showImageModal = signal(false);
  currentImageIndex = signal(0);

  // Agregar estas señales y métodos
  showCloseTicketModal = signal(false);
  justificacionCierre = signal('');
  ticketParaCerrar = signal<any>(null);

  
  private userId: number;
  private role: string;

    private imageBaseUrl = environment.apiURL ? 
    `${environment.apiURL}/images/` : 
    'http://localhost:3000/images/';
  
  private defaultImage = 'image-not-found.jpg';

  constructor() {
    this.userId = this.authService.getUserIdFromToken();
    this.role = this.authService.getRoleFromToken();
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

cerrarTicket(ticket: any): void {
  this.ticketParaCerrar.set(ticket);
  this.justificacionCierre.set('');
  this.showCloseTicketModal.set(true);
}

 closeCloseTicketModal(): void {
  this.showCloseTicketModal.set(false);
  this.ticketParaCerrar.set(null);
  this.justificacionCierre.set('');
} 

confirmarCierreTicket(): void {
  const ticket = this.ticketParaCerrar();
  const justificacion = this.justificacionCierre().trim();
  
  if (!ticket || !justificacion) {
    this.notificationService.warning('Validación', 'Debe escribir una justificación', 4000);
    return;
  }

  this.ticketStateService.cancelarTicket(ticket.id, justificacion).subscribe({
    next: (response) => {
      this.notificationService.success('Éxito', 'Ticket cerrado correctamente', 4000);
      this.closeCloseTicketModal();
      this.loadTickets();
    },
    error: (error) => {
      console.error('Error cerrando ticket:', error);
      this.notificationService.error('Error', error.error?.message || 'No se pudo cerrar el ticket', 4000);
    }
  })}

  puedeCerrarTicket(ticket: any): boolean {
    const estadosNoCerrables = ['CERRADO', 'CANCELADO', 'RESUELTO'];
    return !estadosNoCerrables.includes(ticket.estado);
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
    console.warn('Error cargando imagen, usando imagen por defecto');
    event.target.src = `${this.imageBaseUrl}${this.defaultImage}`;
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filtros.update(f => ({ ...f, search: searchTerm }));
      this.paginacion.update(p => ({ ...p, currentPage: 1 }));
      this.loadTickets();
    });
  }

  onSearchChange(event: any): void {
    this.searchInput.set(event.target.value);
    this.searchSubject.next(event.target.value);
  }

  aplicarFiltro(campo: string, valor: string): void {
    this.filtros.update(f => ({ ...f, [campo]: valor }));
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadTickets();
  }

  limpiarFiltros(): void {
    this.filtros.set({
      search: '',
      estado: '',
      prioridad: '',
      sortBy: 'fechaCreacion',
      sortOrder: 'desc'
    });
    this.searchInput.set('');
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadTickets();
  }

  cambiarPagina(pagina: number | string): void {
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina) : pagina;
    if (paginaNum >= 1 && paginaNum <= this.paginacion().totalPages) {
      this.paginacion.update(p => ({ ...p, currentPage: paginaNum }));
      this.loadTickets();
    }
  }

  cambiarItemsPorPagina(event: any): void {
    const items = parseInt(event.target.value);
    this.paginacion.update(p => ({ 
      ...p, 
      itemsPerPage: items,
      currentPage: 1 
    }));
    this.loadTickets();
  }

  cambiarOrden(campo: string): void {
    const filtrosActuales = this.filtros();
    const nuevoOrden = filtrosActuales.sortBy === campo && 
                      filtrosActuales.sortOrder === 'desc' ? 'asc' : 'desc';
    
    this.filtros.update(f => ({ 
      ...f, 
      sortBy: campo,
      sortOrder: nuevoOrden 
    }));
    this.loadTickets();
  }

  getOrdenIcon(campo: string): string {
    const filtrosActuales = this.filtros();
    if (filtrosActuales.sortBy !== campo) return 'bi-arrow-down-up';
    return filtrosActuales.sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  getPaginationPages(): (number | string)[] {
    const current = this.paginacion().currentPage;
    const total = this.paginacion().totalPages;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    let l: number | null = null; 
    for (let i of range) {
      if (l !== null) { 
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  loadTickets(): void {
    this.isLoading.set(true);

    const filtrosActuales = this.filtros();
    const paginacionActual = this.paginacion();

    this.ticketService.getMisTicketsCreados({
      ...filtrosActuales,
      page: paginacionActual.currentPage,
      limit: paginacionActual.itemsPerPage
    }).subscribe({
      next: (res: any) => {
        if (res && res.tickets && res.pagination) {
          this.tickets.set(res.tickets);
          this.paginacion.set(res.pagination);
        } else {
          this.tickets.set(Array.isArray(res) ? res : []);
          this.paginacion.set({
            currentPage: 1,
            totalPages: 1,
            totalItems: Array.isArray(res) ? res.length : 0,
            itemsPerPage: paginacionActual.itemsPerPage,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar tickets creados:', err);
        this.isLoading.set(false);
        this.tickets.set([]);
      }
    });
  }

  viewTicketDetail(ticket: any): void {
    this.isLoading.set(true);
    this.ticketService.getById(ticket.id).subscribe({
      next: (detalle: any) => {
        this.selectedTicket.set(detalle);
        this.showModal.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle del ticket:', error);
        this.isLoading.set(false);
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedTicket.set(null);
    this.isEditing.set(false);
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
      case 'alta':
        return 'bg-warning';
      case 'media':
        return 'bg-info';
      case 'baja':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getEstadoIcon(estado: string): string {
    if (!estado) return 'bi-question-circle';
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'cerrado': return 'bi-check-circle';
      case 'resuelto': return 'bi-check-circle';
      case 'en_proceso': return 'bi-gear';
      case 'asignado': return 'bi-person-check';
      case 'pendiente': return 'bi-clock';
      case 'espera_cliente': return 'bi-person';
      default: return 'bi-question-circle';
    }
  }

  getSLAClass(cumplimiento: boolean): string {
    return cumplimiento ? 'bg-success' : 'bg-danger';
  }

  getSLAIcon(cumplimiento: boolean): string {
    return cumplimiento ? 'bi-check-circle' : 'bi-exclamation-circle';
  }

  openImageModal(imagen: any): void {
    const imagenes = this.selectedTicket()?.imagenes || [];
    const index = imagenes.findIndex((img: any) => img.id === imagen.id);
    this.currentImageIndex.set(index);
    this.selectedImage.set(imagen);
    this.showImageModal.set(true);
  }

    closeImageModal(): void {
    this.showImageModal.set(false);
    this.selectedImage.set(null);
    this.currentImageIndex.set(0);
  }

    navigateImage(direction: 'prev' | 'next'): void {
    const imagenes = this.selectedTicket()?.imagenes || [];
    let newIndex = this.currentImageIndex();

    if (direction === 'prev') {
      newIndex = (newIndex - 1 + imagenes.length) % imagenes.length;
    } else {
      newIndex = (newIndex + 1) % imagenes.length;
    }

    this.currentImageIndex.set(newIndex);
    this.selectedImage.set(imagenes[newIndex]);
  }

}