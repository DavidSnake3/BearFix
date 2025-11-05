import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { TecnicoService } from '../../../share/services/api/tecnico.service';
import { Usuario } from '../../../share/models/UsuarioModel';

@Component({
  selector: 'app-tecnicos',
  templateUrl: './tecnicos.html',
  styleUrls: ['./tecnicos.css'],
  standalone: false
})
export class TecnicosComponent implements OnInit, OnDestroy {
  private tecnicoService = inject(TecnicoService);
  private destroy$ = new Subject<void>();

  tecnicos = signal<Usuario[]>([]);
  selectedTecnico = signal<any>(null);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  editTecnicoData = signal<any>(null);
  originalTecnico = signal<any>(null);

  searchInput = signal<string>('');
  filtroDisponible = signal<string>('');
  private searchSubject = new Subject<string>();

  paginacion = signal({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 5,
    hasNextPage: false,
    hasPrevPage: false
  });

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadTecnicos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.paginacion.update(p => ({ ...p, currentPage: 1 }));
      this.loadTecnicos();
    });
  }

  onSearchChange(event: any): void {
    this.searchInput.set(event.target.value);
    this.searchSubject.next(event.target.value);
  }

  onDisponibleChange(disponible: string): void {
    this.filtroDisponible.set(disponible);
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadTecnicos();
  }

  loadTecnicos(): void {
    this.isLoading.set(true);
    
    const filtros = {
      search: this.searchInput(),
      disponible: this.filtroDisponible(),
      page: this.paginacion().currentPage,
      limit: this.paginacion().itemsPerPage
    };
    
    this.tecnicoService.get(filtros).subscribe({
      next: (response) => {
        if (response.tecnicos && response.pagination) {
          this.tecnicos.set(response.tecnicos);
          this.paginacion.set(response.pagination);
        } else {
          this.tecnicos.set(response);
          this.paginacion.set({
            currentPage: 1,
            totalPages: 1,
            totalItems: response.length,
            itemsPerPage: 5,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando técnicos:', error);
        this.isLoading.set(false);
      }
    });
  }

  cambiarPagina(pagina: number | string): void {
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina) : pagina;
    
    if (paginaNum >= 1 && paginaNum <= this.paginacion().totalPages) {
      this.paginacion.update(p => ({ ...p, currentPage: paginaNum }));
      this.loadTecnicos();
    }
  }

  cambiarItemsPorPagina(items: number): void {
    this.paginacion.update(p => ({ 
      ...p, 
      itemsPerPage: items,
      currentPage: 1 
    }));
    this.loadTecnicos();
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

  limpiarFiltros(): void {
    this.searchInput.set('');
    this.filtroDisponible.set('');
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadTecnicos();
  }

  viewTecnicoDetail(tecnico: Usuario): void {
    this.isLoading.set(true);
    this.tecnicoService.getById(tecnico.id!).subscribe({
      next: (detail) => {
        this.selectedTecnico.set(detail);
        this.showModal.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle del técnico:', error);
        this.isLoading.set(false);
      }
    });
  }

  enableEditMode(tecnico: Usuario): void {
    this.isLoading.set(true);
    this.tecnicoService.getById(tecnico.id!).subscribe({
      next: (detail) => {
        this.selectedTecnico.set(detail);
        this.showModal.set(true);
        this.enableEdit();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle del técnico:', error);
        this.isLoading.set(false);
      }
    });
  }

  enableEdit() {
    this.isEditing.set(true);
    this.originalTecnico.set(JSON.parse(JSON.stringify(this.selectedTecnico())));
    this.editTecnicoData.set(JSON.parse(JSON.stringify(this.selectedTecnico())));
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.selectedTecnico.set(JSON.parse(JSON.stringify(this.originalTecnico())));
    this.originalTecnico.set(null);
    this.editTecnicoData.set(null);
  }

  saveTecnico() {
    console.log('Guardando técnico:', this.editTecnicoData());
    this.selectedTecnico.set({ ...this.editTecnicoData() });
    this.isEditing.set(false);
    this.originalTecnico.set(null);
    this.editTecnicoData.set(null);
    this.loadTecnicos();
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.selectedTecnico.set(null);
    this.originalTecnico.set(null);
    this.editTecnicoData.set(null);
  }

  deleteTecnico(tecnico: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al técnico "${tecnico.nombre}"?`)) {
      console.log('Eliminar técnico:', tecnico);
    }
  }

  getWorkloadPercentage(current: number, limit: number): number {
    if (!limit || limit === 0) return 0;
    const percentage = (current / limit) * 100;
    return Math.min(percentage, 100);
  }

  getWorkloadClass(current: number, limit: number): string {
    if (!limit || limit === 0) return 'low';
    const percentage = current / limit;
    if (percentage < 0.7) return 'low';
    if (percentage < 1) return 'medium';
    return 'high';
  }

  getPrioridadBadgeClass(prioridad: string): string {
    if (!prioridad) return 'bg-secondary';

    const prioridadLower = prioridad.toLowerCase();
    switch (prioridadLower) {
      case 'critico':
      case 'alta':
        return 'bg-danger';
      case 'media':
        return 'bg-warning';
      case 'baja':
        return 'bg-success';
      default:
        return 'bg-secondary';
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
}