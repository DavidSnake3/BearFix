import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { CategoriaService } from '../../../share/services/api/categoria.service';
import { Categoria } from '../../../share/models/CategoriaModel';

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class CategoriasComponent implements OnInit, OnDestroy {
  private categoriaService = inject(CategoriaService);
  private destroy$ = new Subject<void>();

  categorias = signal<Categoria[]>([]);
  selectedCategoria = signal<any>(null);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  editCategoriaData = signal<any>(null);
  originalCategoria = signal<any>(null);

  searchInput = signal<string>('');
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
    this.loadCategorias();
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
      this.loadCategorias();
    });
  }

  onSearchChange(event: any): void {
    this.searchInput.set(event.target.value);
    this.searchSubject.next(event.target.value);
  }

  loadCategorias(): void {
    this.isLoading.set(true);
    
    const filtros = {
      search: this.searchInput(),
      page: this.paginacion().currentPage,
      limit: this.paginacion().itemsPerPage
    };
    
    this.categoriaService.get(filtros).subscribe({
      next: (response) => {
        if (response.categorias && response.pagination) {
          this.categorias.set(response.categorias);
          this.paginacion.set(response.pagination);
        } else {
          this.categorias.set(response);
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
        console.error('Error cargando categorías:', error);
        this.isLoading.set(false);
      }
    });
  }

  cambiarPagina(pagina: number | string): void {
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina) : pagina;
    
    if (paginaNum >= 1 && paginaNum <= this.paginacion().totalPages) {
      this.paginacion.update(p => ({ ...p, currentPage: paginaNum }));
      this.loadCategorias();
    }
  }

  cambiarItemsPorPagina(items: number): void {
    this.paginacion.update(p => ({ 
      ...p, 
      itemsPerPage: items,
      currentPage: 1 
    }));
    this.loadCategorias();
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
    this.paginacion.update(p => ({ ...p, currentPage: 1 }));
    this.loadCategorias();
  }

  viewCategoriaDetail(categoria: Categoria): void {
    this.isLoading.set(true);
    this.categoriaService.getById(categoria.id!).subscribe({
      next: (detalle) => {
        this.selectedCategoria.set(detalle);
        this.showModal.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle de la categoría:', error);
        this.isLoading.set(false);
      }
    });
  }

  enableEditMode(categoria: Categoria): void {
    this.isLoading.set(true);
    this.categoriaService.getById(categoria.id!).subscribe({
      next: (detalle) => {
        this.selectedCategoria.set(detalle);
        this.showModal.set(true);
        this.enableEdit();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle de la categoría:', error);
        this.isLoading.set(false);
      }
    });
  }

  enableEdit() {
    this.isEditing.set(true);
    this.originalCategoria.set(JSON.parse(JSON.stringify(this.selectedCategoria())));
    this.editCategoriaData.set(JSON.parse(JSON.stringify(this.selectedCategoria())));
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.selectedCategoria.set(JSON.parse(JSON.stringify(this.originalCategoria())));
    this.originalCategoria.set(null);
    this.editCategoriaData.set(null);
  }

  saveCategoria() {
    console.log('Guardando categoría:', this.editCategoriaData());
    this.selectedCategoria.set({ ...this.editCategoriaData() });
    this.isEditing.set(false);
    this.originalCategoria.set(null);
    this.editCategoriaData.set(null);
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.selectedCategoria.set(null);
    this.originalCategoria.set(null);
    this.editCategoriaData.set(null);
  }

  deleteCategoria(categoria: Categoria): void {
    if (confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      this.categoriaService.delete(categoria).subscribe({
        next: () => {
          this.loadCategorias();
        },
        error: (error) => {
          console.error('Error eliminando categoría:', error);
        }
      });
    }
  }

  getNivelUrgenciaBadgeClass(nivelUrgencia: string): string {
    if (!nivelUrgencia) return 'bg-secondary';

    const nivel = nivelUrgencia.toLowerCase();
    switch (nivel) {
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

  getEstadoBadgeClass(activa: boolean): string {
    return activa ? 'bg-success text-white' : 'bg-secondary text-white';
  }
}