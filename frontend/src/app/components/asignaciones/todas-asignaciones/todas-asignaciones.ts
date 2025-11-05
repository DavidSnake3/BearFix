
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { AuthService } from '../../../share/services/api/auth.service';
import { AsignacionService } from '../../../share/services/api/asignacion.service';

@Component({
  selector: 'app-todas-asignaciones',
  standalone: false,
  templateUrl: './todas-asignaciones.html',
  styleUrl: './todas-asignaciones.css'
})
export class TodasAsignacionesComponent implements OnInit, OnDestroy {
  private asignacionService = inject(AsignacionService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  asignaciones = signal<any[]>([]);
  isLoading = signal(true);
  selectedAsignacion = signal<any>(null);
  showModal = signal(false);

  filtros = signal({
    search: '',
    estado: '',
    prioridad: '',
    categoria: '',
    tecnico: '',
    sortBy: 'fechaAsignacion',
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

  estados = signal<string[]>([]);
  prioridades = signal<string[]>([]);
  categorias = signal<string[]>([]);
  tecnicos = signal<string[]>([]);

  userRole = signal<string>('');
  searchInput = signal<string>('');

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadUserInfo();

    if (this.userRole() === 'ADM') {
      this.setupSearchDebounce();
      this.loadAsignaciones();
      this.loadFiltrosOpciones();
    } else {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filtros.update(f => ({ ...f, search: searchTerm }));
      this.paginacion.update(p => ({ ...p, currentPage: 1 }));
      this.loadAsignaciones();
    });
  }

  onSearchChange(event: any): void {
    this.searchInput.set(event.target.value);
    this.searchSubject.next(event.target.value);
  }

  private loadUserInfo(): void {
    this.userRole.set(this.authService.getRoleFromToken());
  }

  private loadFiltrosOpciones(): void {

    this.estados.set(['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE', 'RESUELTO', 'CERRADO']);
    this.prioridades.set(['CRITICO', 'ALTO', 'MEDIO', 'BAJO']);

    this.categorias.set([]);
    this.tecnicos.set([]);
  }

  loadAsignaciones(): void {
    if (this.userRole() !== 'ADM') {
      return;
    }

    this.isLoading.set(true);

    const filtrosActuales = this.filtros();
    const paginacionActual = this.paginacion();


    this.asignacionService.getTodasAsignacionesConFiltros({
      ...filtrosActuales,
      page: paginacionActual.currentPage,
      limit: paginacionActual.itemsPerPage
    }).subscribe({
      next: (data) => {
        this.asignaciones.set(data.asignaciones);
        this.paginacion.set(data.pagination);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
      }
    });
  }

  aplicarFiltro(campo: string, valor: string): void {
    this.filtros.update(f => ({ ...f, [campo]: valor }));
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadAsignaciones();
  }

  limpiarFiltros(): void {
    this.filtros.set({
      search: '',
      estado: '',
      prioridad: '',
      categoria: '',
      tecnico: '',
      sortBy: 'fechaAsignacion',
      sortOrder: 'desc'
    });
    this.searchInput.set('');
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadAsignaciones();
  }

  cambiarPagina(pagina: number | string): void {
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina) : pagina;

    if (paginaNum >= 1 && paginaNum <= this.paginacion().totalPages) {
      this.paginacion.update(p => ({ ...p, currentPage: paginaNum }));
      this.loadAsignaciones();
    }
  }

  cambiarItemsPorPagina(items: number): void {
    this.paginacion.update(p => ({
      ...p,
      itemsPerPage: items,
      currentPage: 1
    }));
    this.loadAsignaciones();
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
    this.loadAsignaciones();
  }

  getOrdenIcon(campo: string): string {
    const filtrosActuales = this.filtros();
    if (filtrosActuales.sortBy !== campo) return 'bi-arrow-down-up';
    return filtrosActuales.sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  viewAsignacionDetail(asignacion: any): void {
    if (this.userRole() !== 'ADM') {
      alert('No tienes permisos para ver detalles de asignaciones.');
      return;
    }

    this.isLoading.set(true);
    this.asignacionService.getAsignacionById(asignacion.id).subscribe({
      next: (detalle) => {
        console.log(' Detalle de asignación cargado:', detalle);
        this.selectedAsignacion.set(detalle);
        this.showModal.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);

        if (error.status === 404) {
          alert('No se encontró el detalle de la asignación seleccionada.');
        } else if (error.status === 403) {
          alert('No tienes permisos para ver esta asignación.');
        } else {
          alert('Error al cargar el detalle de la asignación.');
        }
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedAsignacion.set(null);
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

  getPrioridadBadgeClass(prioridad: string): string {
    if (!prioridad) return 'bg-secondary';

    const prioridadLower = prioridad.toLowerCase();
    switch (prioridadLower) {
      case 'critico':
        return 'bg-danger text-white';
      case 'alta':
        return 'bg-warning text-dark';
      case 'media':
        return 'bg-info text-white';
      case 'baja':
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

  getUrgenciaBadgeClass(colorUrgencia: string): string {
    switch (colorUrgencia) {
      case 'danger': return 'bg-danger text-white';
      case 'warning': return 'bg-warning text-dark';
      case 'success': return 'bg-success text-white';
      default: return 'bg-info text-white';
    }
  }

  getSLAClass(cumplimiento: boolean): string {
    return cumplimiento ? 'text-success' : 'text-danger';
  }

  getSLAIcon(cumplimiento: boolean): string {
    return cumplimiento ? 'bi-check-circle' : 'bi-exclamation-circle';
  }
}