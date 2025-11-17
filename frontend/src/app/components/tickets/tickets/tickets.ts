import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { Ticket, Etiqueta } from '../../../share/models/TicketModel';
import { TicketService } from '../../../share/services/api/ticket.service';
import { FileUploadService } from '../../../share/services/api/file-upload.service';
import { EtiquetaService } from '../../../share/services/api/etiqueta.service';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../share/services/api/auth.service';
import { NotificationService } from '../../../share/services/app/notification.service';

@Component({
  selector: 'app-tickets',
  standalone: false,
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class TicketsComponent implements OnInit, OnDestroy {
  private ticketService = inject(TicketService);
  private fileUploadService = inject(FileUploadService);
  private etiquetaService = inject(EtiquetaService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  tickets = signal<Ticket[]>([]);
  selectedTicket = signal<any>(null);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  originalTicket = signal<any>(null);
  editTicketData = signal<any>(null);

  showCreateModal = signal(false);
  showUserModal = signal(false);
  newTicket = signal<any>({
    titulo: '',
    descripcion: '',
    prioridad: 'MEDIO',
    categoriaId: null,
    etiquetaId: null,
    solicitanteId: null
  });

  prioridadesList = signal<string[]>([]);
  categoriasConEtiquetas = signal<any[]>([]);
  usuariosList = signal<any[]>([]);
  usuarioSolicitante = signal<any>(null);
  etiquetasFiltradasCreacion = signal<Etiqueta[]>([]);
  etiquetasFiltradasEdicion = signal<Etiqueta[]>([]);

  imageZoom = signal(1);
  selectedImage = signal<any>(null);
  showImageModal = signal(false);
  imageLoading = signal(true);
  currentImageIndex = signal<number>(0);

  nuevaValoracion = signal({
    puntuacion: 0,
    comentario: ''
  });

  filtros = signal({
    search: '',
    categoria: '',
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

  categorias = signal<string[]>([]);
  estados = signal<string[]>(['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE', 'RESUELTO', 'CERRADO']);
  prioridades = signal<string[]>(['BAJO', 'MEDIO', 'ALTO', 'CRITICO']);

  userRole = signal<string>('');
  searchInput = signal<string>('');

  today = new Date();

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadUserInfo();
    this.setupSearchDebounce();
    this.loadTickets();
    this.loadCategoriasConEtiquetas();
    this.loadPrioridades();
    this.loadUsuarios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserInfo(): void {
    this.userRole.set(this.authService.getRoleFromToken());
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

  private loadPrioridades(): void {
    this.ticketService.getPrioridades().subscribe({
      next: (prioridades) => {
        this.prioridadesList.set(prioridades);
      },
      error: (error) => {
        console.error('Error cargando prioridades:', error);
        this.notificationService.error('Error', 'No se pudieron cargar las prioridades', 4000);
      }
    });
  }

  private loadCategoriasConEtiquetas(): void {
    this.ticketService.getCategoriasConEtiquetas().subscribe({
      next: (categorias) => {
        this.categoriasConEtiquetas.set(categorias);
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
        this.notificationService.error('Error', 'No se pudieron cargar las categorías', 4000);
      }
    });
  }

  private loadUsuarios(): void {
    this.ticketService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuariosList.set(usuarios);
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.notificationService.error('Error', 'No se pudieron cargar los usuarios', 4000);
      }
    });
  }

  onSearchChange(event: any): void {
    this.searchInput.set(event.target.value);
    this.searchSubject.next(event.target.value);
  }

  onCategoriaChange(categoriaId: number): void {
    this.newTicket.update(ticket => ({ 
      ...ticket, 
      categoriaId: categoriaId,
      etiquetaId: null
    }));

    // Limpiar etiquetas mientras se cargan
    this.etiquetasFiltradasCreacion.set([]);

    if (categoriaId) {
      this.ticketService.getEtiquetasByCategoria(categoriaId).subscribe({
        next: (response) => {
          this.etiquetasFiltradasCreacion.set(response.etiquetas);
        },
        error: (error) => {
          console.error('Error cargando etiquetas:', error);
          this.notificationService.error('Error', 'No se pudieron cargar las etiquetas', 4000);
        }
      });
    }
  }

  onCategoriaChangeEdit(categoriaId: number): void {
    this.editTicketData.update(ticket => ({ 
      ...ticket, 
      categoriaId: categoriaId,
      etiquetaId: null
    }));

    // Limpiar etiquetas mientras se cargan
    this.etiquetasFiltradasEdicion.set([]);

    if (categoriaId) {
      this.ticketService.getEtiquetasByCategoria(categoriaId).subscribe({
        next: (response) => {
          this.etiquetasFiltradasEdicion.set(response.etiquetas);
        },
        error: (error) => {
          console.error('Error cargando etiquetas:', error);
          this.notificationService.error('Error', 'No se pudieron cargar las etiquetas', 4000);
        }
      });
    }
  }

  loadTickets(): void {
    this.isLoading.set(true);

    const filtrosActuales = this.filtros();
    const paginacionActual = this.paginacion();

    this.ticketService.get({
      ...filtrosActuales,
      page: paginacionActual.currentPage,
      limit: paginacionActual.itemsPerPage
    }).subscribe({
      next: (response) => {
        if (response.tickets && response.pagination) {
          this.tickets.set(response.tickets);
          this.paginacion.set(response.pagination);
        } else {
          this.tickets.set(response);
          this.paginacion.set({
            currentPage: 1,
            totalPages: 1,
            totalItems: response.length,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando tickets:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudieron cargar los tickets', 4000);
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.newTicket.set({
      titulo: '',
      descripcion: '',
      prioridad: 'MEDIO',
      categoriaId: null,
      etiquetaId: null,
      solicitanteId: null
    });
    this.usuarioSolicitante.set(null);
    this.etiquetasFiltradasCreacion.set([]);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  openUserModal(): void {
    this.showUserModal.set(true);
  }

  closeUserModal(): void {
    this.showUserModal.set(false);
  }

  selectUsuario(usuario: any): void {
    this.usuarioSolicitante.set(usuario);
    this.newTicket.update(ticket => ({ ...ticket, solicitanteId: usuario.id }));
    this.closeUserModal();
  }

  createTicket(): void {
    const ticketData = this.newTicket();

    if (!ticketData.titulo || !ticketData.categoriaId || !ticketData.etiquetaId || !ticketData.solicitanteId) {
      this.notificationService.warning('Formulario incompleto', 'Por favor completa todos los campos requeridos', 4000);
      return;
    }

    this.isLoading.set(true);
    this.ticketService.createTicket(ticketData).subscribe({
      next: (ticketCreado) => {
        this.showCreateModal.set(false);
        this.loadTickets();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Ticket creado exitosamente', 4000);
      },
      error: (error) => {
        console.error('Error creando ticket:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo crear el ticket', 4000);
      }
    });
  }

  aplicarFiltro(campo: string, valor: string): void {
    this.filtros.update(f => ({ ...f, [campo]: valor }));
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadTickets();
  }

  limpiarFiltros(): void {
    this.filtros.set({
      search: '',
      categoria: '',
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

  cambiarItemsPorPagina(items: number): void {
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

  private imageBaseUrl = environment.apiURL ? 
    `${environment.apiURL}/images/` : 
    'http://localhost:3000/images/';
  
  private defaultImage = 'image-not-found.jpg';

  getImageUrl(imageName: string): string {
    if (!imageName) {
      return `${this.imageBaseUrl}${this.defaultImage}`;
    }
    return `${this.imageBaseUrl}${imageName}`;
  }

  handleImageError(event: any): void {
    console.warn('Error cargando imagen, usando imagen por defecto');
    event.target.src = `${this.imageBaseUrl}${this.defaultImage}`;
  }

  zoomIn(): void {
    this.imageZoom.update(zoom => Math.min(zoom + 0.25, 3));
  }

  zoomOut(): void {
    this.imageZoom.update(zoom => Math.max(zoom - 0.25, 0.5));
  }

  resetZoom(): void {
    this.imageZoom.set(1);
  }

  getCurrentImageIndex(): number {
    const selectedImage = this.selectedImage();
    const currentTicket = this.selectedTicket();
    
    if (!selectedImage || !currentTicket || !currentTicket.imagenes) {
      return 0;
    }
    
    return currentTicket.imagenes.findIndex((img: any) => img.id === selectedImage.id);
  }

  getImageCounterText(): string {
    const currentIndex = this.getCurrentImageIndex();
    const totalImages = this.selectedTicket()?.imagenes?.length || 0;
    
    if (totalImages === 0) return '';
    
    return `${currentIndex + 1} de ${totalImages}`;
  }

  navigateImage(direction: number): void {
    const currentTicket = this.selectedTicket();
    if (!currentTicket || !currentTicket.imagenes) return;

    const currentIndex = this.getCurrentImageIndex();
    const newIndex = (currentIndex + direction + currentTicket.imagenes.length) % currentTicket.imagenes.length;
    
    this.selectedImage.set(currentTicket.imagenes[newIndex]);
    this.imageLoading.set(true);
    this.imageZoom.set(1); 
  }

  getImageTransform(): string {
    return `scale(${this.imageZoom()})`;
  }

  openImageModal(imagen: any): void {
    this.selectedImage.set(imagen);
    this.showImageModal.set(true);
    this.imageLoading.set(true);
    this.imageZoom.set(1); 
  }

  closeImageModal(): void {
    this.showImageModal.set(false);
    this.selectedImage.set(null);
    this.imageLoading.set(false);
  }

  onImageLoad(): void {
    this.imageLoading.set(false);
  }

  downloadImage(imageName: string): void {
    const imageUrl = this.getImageUrl(imageName);
    window.open(imageUrl, '_blank');
  }

  viewTicketDetail(ticket: Ticket): void {
    this.isLoading.set(true);
    this.ticketService.getById(ticket.id!).subscribe({
      next: (detalle) => {
        this.selectedTicket.set(detalle);
        this.showModal.set(true);
        this.isLoading.set(false);
        this.nuevaValoracion.set({ puntuacion: 0, comentario: '' });
      },
      error: (error) => {
        console.error('Error cargando detalle del ticket:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo cargar el detalle del ticket', 4000);
      }
    });
  }

  setPuntuacion(puntuacion: number): void {
    this.nuevaValoracion.update(val => ({ ...val, puntuacion }));
  }

  agregarValoracion(): void {
    const selectedTicket = this.selectedTicket();
    const valoracion = this.nuevaValoracion();

    if (!selectedTicket || valoracion.puntuacion === 0) {
      this.notificationService.warning('Validación', 'Por favor selecciona una puntuación', 4000);
      return;
    }

    this.ticketService.crearValoracion(selectedTicket.id, valoracion.puntuacion, valoracion.comentario).subscribe({
      next: (valoracionCreada) => {
        this.selectedTicket.update(ticket => ({ ...ticket, valoracion: valoracionCreada }));
        this.nuevaValoracion.set({ puntuacion: 0, comentario: '' });
        this.notificationService.success('Éxito', 'Valoración enviada exitosamente', 4000);
      },
      error: (error) => {
        console.error('Error enviando valoración:', error);
        this.notificationService.error('Error', 'Error al enviar la valoración', 4000);
      }
    });
  }

  enableEditMode(ticket: Ticket): void {
    this.isLoading.set(true);
    this.ticketService.getById(ticket.id!).subscribe({
      next: (detalle) => {
        this.selectedTicket.set(detalle);
        this.showModal.set(true);
        this.enableEdit();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle del ticket:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo cargar el detalle del ticket', 4000);
      }
    });
  }

  enableEdit() {
    this.isEditing.set(true);
    this.originalTicket.set(JSON.parse(JSON.stringify(this.selectedTicket())));
    this.editTicketData.set(JSON.parse(JSON.stringify(this.selectedTicket())));
    
    // Cargar etiquetas de la categoría actual en edición
    const categoriaId = this.editTicketData().categoriaId;
    if (categoriaId) {
      this.ticketService.getEtiquetasByCategoria(categoriaId).subscribe({
        next: (response) => {
          this.etiquetasFiltradasEdicion.set(response.etiquetas);
        },
        error: (error) => {
          console.error('Error cargando etiquetas:', error);
          this.notificationService.error('Error', 'No se pudieron cargar las etiquetas', 4000);
        }
      });
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.selectedTicket.set(JSON.parse(JSON.stringify(this.originalTicket())));
    this.originalTicket.set(null);
    this.editTicketData.set(null);
  }

  saveTicket() {
    const updateData = {
      id: this.editTicketData().id,
      titulo: this.editTicketData().titulo,
      descripcion: this.editTicketData().descripcion,
      categoriaId: this.editTicketData().categoriaId,
      etiquetaId: this.editTicketData().etiquetaId,
      prioridad: this.editTicketData().prioridad,
      estado: this.editTicketData().estado,
      observacionesCambioEstado: 'Ticket actualizado'
    };

    this.ticketService.updateTicket(updateData).subscribe({
      next: (ticketActualizado) => {
        this.selectedTicket.set(ticketActualizado);
        this.isEditing.set(false);
        this.originalTicket.set(null);
        this.editTicketData.set(null);
        this.loadTickets();
        this.notificationService.success('Éxito', 'Ticket actualizado exitosamente', 4000);
      },
      error: (error) => {
        console.error('Error actualizando ticket:', error);
        this.notificationService.error('Error', 'No se pudo actualizar el ticket', 4000);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.selectedTicket.set(null);
    this.originalTicket.set(null);
    this.editTicketData.set(null);
    this.nuevaValoracion.set({ puntuacion: 0, comentario: '' });
  }

  deleteTicket(ticket: Ticket): void {
    if (confirm(`¿Estás seguro de eliminar el ticket "${ticket.titulo}"?`)) {
      this.ticketService.deleteTicket(ticket.id!).subscribe({
        next: () => {
          this.loadTickets();
          this.notificationService.success('Éxito', 'Ticket eliminado exitosamente', 4000);
        },
        error: (error) => {
          console.error('Error eliminando ticket:', error);
          this.notificationService.error('Error', 'No se pudo eliminar el ticket', 4000);
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    if (!estado) return 'bg-secondary';

    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'cerrado':
      case 'resuelto':
        return 'bg-success text-white';
      case 'en_proceso':
      case 'asignado':
        return 'bg-primary text-white';
      case 'pendiente':
        return 'bg-warning text-dark';
      case 'espera_cliente':
        return 'bg-info text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  getPrioridadBadgeClass(prioridad: string | undefined): string {
    if (!prioridad) return 'bg-secondary';

    const prioridadLower = prioridad.toLowerCase();
    switch (prioridadLower) {
      case 'critico':
        return 'bg-danger text-white';
      case 'alto':
        return 'bg-warning text-dark';
      case 'medio':
        return 'bg-info text-white';
      case 'bajo':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
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
    return cumplimiento ? 'text-success' : 'text-danger';
  }

  getSLAIcon(cumplimiento: boolean): string {
    return cumplimiento ? 'bi-check-circle' : 'bi-exclamation-circle';
  }
}