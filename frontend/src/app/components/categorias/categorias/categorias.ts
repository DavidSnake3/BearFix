import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '../../../share/models/CategoriaModel';
import { EspecialidadService, CreateEspecialidadRequest, UpdateEspecialidadRequest } from '../../../share/services/api/especialidad.service';
import { Especialidad } from '../../../share/models/EspecialidadModel';
import { Etiqueta } from '../../../share/models/EtiquetaModel';
import { NotificationService } from '../../../share/services/app/notification.service';
import { CategoriaService } from '../../../share/services/api/categoria.service';
import { EtiquetaService, CreateEtiquetaRequest, UpdateEtiquetaRequest } from '../../../share/services/api/etiqueta.service';

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.html',
  styleUrl: './categorias.css'
})
export class CategoriasComponent implements OnInit, OnDestroy {
  private categoriaService = inject(CategoriaService);
  private especialidadService = inject(EspecialidadService);
  private etiquetaService = inject(EtiquetaService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  categorias = signal<Categoria[]>([]);
  selectedCategoria = signal<any>(null);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  editCategoriaData = signal<any>(null);
  originalCategoria = signal<any>(null);

  // Señales para crear categoría
  showCreateModal = signal(false);
  newCategoria = signal<CreateCategoriaRequest>({
    codigo: '',
    nombre: '',
    descripcion: '',
    etiquetas: [],
    especialidades: []
  });


  // Listas para selección
  especialidadesList = signal<Especialidad[]>([]);
  etiquetasList = signal<Etiqueta[]>([]);

  // Modales de selección
  showEspecialidadesModal = signal(false);
  showEtiquetasModal = signal(false);
  isEspecialidadesForCreate = signal(false);
  isEtiquetasForCreate = signal(false);

  // Búsquedas en modales
  especialidadesSearch = signal('');
  etiquetasSearch = signal('');

  // Listas filtradas
  especialidadesFiltradas = computed(() => {
    const search = this.especialidadesSearch().toLowerCase();
    return this.especialidadesList().filter(esp =>
      esp.nombre.toLowerCase().includes(search) ||
      (esp.descripcion && esp.descripcion.toLowerCase().includes(search)) ||
      esp.codigo.toLowerCase().includes(search)
    );
  });

  etiquetasFiltradas = computed(() => {
    const search = this.etiquetasSearch().toLowerCase();
    return this.etiquetasList().filter(etq =>
      etq.nombre.toLowerCase().includes(search) ||
      (etq.descripcion && etq.descripcion.toLowerCase().includes(search))
    );
  });

  // Gestión de etiquetas y especialidades
  showGestionEtiquetaModal = signal(false);
  showGestionEspecialidadModal = signal(false);
  etiquetaEditando = signal<Etiqueta | null>(null);
  especialidadEditando = signal<Especialidad | null>(null);
  nuevaEtiqueta = signal<CreateEtiquetaRequest>({ nombre: '', descripcion: '' });
  nuevaEspecialidad = signal<CreateEspecialidadRequest>({ codigo: '', nombre: '', descripcion: '' });

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

  // Señales para pestañas de gestión
  etiquetasTabActive = signal<'select' | 'manage'>('select');
  especialidadesTabActive = signal<'select' | 'manage'>('select');

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCategorias();
    this.loadEspecialidades();
    this.loadEtiquetas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEspecialidades(): void {
    this.especialidadService.get().subscribe({
      next: (especialidades: Especialidad[]) => {
        this.especialidadesList.set(especialidades);
      },
      error: (error: any) => {
        console.error('Error cargando especialidades:', error);
        this.notificationService.error('Error', 'No se pudieron cargar las especialidades', 4000);
      }
    });
  }

  private loadEtiquetas(): void {
    this.etiquetaService.get().subscribe({
      next: (etiquetas: Etiqueta[]) => {
        this.etiquetasList.set(etiquetas);
      },
      error: (error: any) => {
        console.error('Error cargando etiquetas:', error);
        this.notificationService.error('Error', 'No se pudieron cargar las etiquetas', 4000);
      }
    });
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
      error: (error: any) => {
        console.error('Error cargando categorías:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudieron cargar las categorías', 4000);
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
      error: (error: any) => {
        console.error('Error cargando detalle de la categoría:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo cargar el detalle de la categoría', 4000);
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
      error: (error: any) => {
        console.error('Error cargando detalle de la categoría:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo cargar el detalle de la categoría', 4000);
      }
    });
  }

  enableEdit() {
    this.isEditing.set(true);
    this.originalCategoria.set(JSON.parse(JSON.stringify(this.selectedCategoria())));

    const editData = JSON.parse(JSON.stringify(this.selectedCategoria()));
    editData.etiquetas = editData.etiquetas?.map((etq: any) => etq.id) || [];
    editData.especialidades = editData.especialidades?.map((esp: any) => esp.id) || [];

    this.editCategoriaData.set(editData);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.selectedCategoria.set(JSON.parse(JSON.stringify(this.originalCategoria())));
    this.originalCategoria.set(null);
    this.editCategoriaData.set(null);
  }

  saveCategoria(): void {
    const categoriaData = this.editCategoriaData();

    if (!categoriaData?.nombre || !categoriaData?.codigo) {
      this.notificationService.warning(
        'Formulario incompleto',
        'Por favor completa todos los campos requeridos correctamente',
        4000
      );
      return;
    }

    if (categoriaData.slaTiempoMaxRespuestaMin && categoriaData.slaTiempoMaxRespuestaMin <= 0) {
      this.notificationService.warning(
        'Validación de SLA',
        'El tiempo máximo de respuesta debe ser mayor a cero',
        4000
      );
      return;
    }

    if (categoriaData.slaTiempoMaxResolucionMin && categoriaData.slaTiempoMaxRespuestaMin) {
      if (categoriaData.slaTiempoMaxResolucionMin <= categoriaData.slaTiempoMaxRespuestaMin) {
        this.notificationService.warning(
          'Validación de SLA',
          'El tiempo máximo de resolución debe ser mayor al tiempo de respuesta',
          4000
        );
        return;
      }
    }

    const updateData: UpdateCategoriaRequest = {
      id: categoriaData.id,
      codigo: categoriaData.codigo,
      nombre: categoriaData.nombre,
      descripcion: categoriaData.descripcion,
      slaNombre: categoriaData.slaNombre,
      slaTiempoMaxRespuestaMin: categoriaData.slaTiempoMaxRespuestaMin,
      slaTiempoMaxResolucionMin: categoriaData.slaTiempoMaxResolucionMin,
      slaDescripcion: categoriaData.slaDescripcion,
      slaNivelUrgencia: categoriaData.slaNivelUrgencia,
      etiquetas: categoriaData.etiquetas || [],
      especialidades: categoriaData.especialidades || []
    };

    this.isLoading.set(true);
    this.categoriaService.updateCategoria(updateData).subscribe({
      next: (categoriaActualizada) => {
        this.selectedCategoria.set(categoriaActualizada);
        this.isEditing.set(false);
        this.originalCategoria.set(null);
        this.editCategoriaData.set(null);
        this.loadCategorias();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Categoría actualizada exitosamente', 4000);
      },
      error: (error: any) => {
        console.error('Error actualizando categoría:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo actualizar la categoría', 4000);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.selectedCategoria.set(null);
    this.originalCategoria.set(null);
    this.editCategoriaData.set(null);
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.newCategoria.set({
      codigo: '',
      nombre: '',
      descripcion: '',
      etiquetas: [],
      especialidades: []
    });
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createCategoria(): void {
    const categoriaData = this.newCategoria();

    if (!categoriaData.nombre || !categoriaData.codigo) {
      this.notificationService.warning(
        'Formulario incompleto',
        'Por favor completa todos los campos requeridos correctamente',
        4000
      );
      return;
    }

    if (categoriaData.slaTiempoMaxRespuestaMin && categoriaData.slaTiempoMaxRespuestaMin <= 0) {
      this.notificationService.warning(
        'Validación de SLA',
        'El tiempo máximo de respuesta debe ser mayor a cero',
        4000
      );
      return;
    }

    if (categoriaData.slaTiempoMaxResolucionMin && categoriaData.slaTiempoMaxRespuestaMin) {
      if (categoriaData.slaTiempoMaxResolucionMin <= categoriaData.slaTiempoMaxRespuestaMin) {
        this.notificationService.warning(
          'Validación de SLA',
          'El tiempo máximo de resolución debe ser mayor al tiempo de respuesta',
          4000
        );
        return;
      }
    }

    this.isLoading.set(true);
    this.categoriaService.createCategoria(categoriaData).subscribe({
      next: (categoriaCreada) => {
        this.showCreateModal.set(false);
        this.loadCategorias();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Categoría creada exitosamente', 4000);
      },
      error: (error: any) => {
        console.error('Error creando categoría:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo crear la categoría', 4000);
      }
    });
  }

  openEspecialidadesModal(forCreate: boolean): void {
    this.isEspecialidadesForCreate.set(forCreate);
    this.showEspecialidadesModal.set(true);
    this.especialidadesSearch.set('');
    this.especialidadesTabActive.set('select');
  }

  openEtiquetasModal(forCreate: boolean): void {
    this.isEtiquetasForCreate.set(forCreate);
    this.showEtiquetasModal.set(true);
    this.etiquetasSearch.set('');
    this.etiquetasTabActive.set('select');
  }

  closeEspecialidadesModal(): void {
    this.showEspecialidadesModal.set(false);
    this.especialidadesSearch.set('');
  }

  closeEtiquetasModal(): void {
    this.showEtiquetasModal.set(false);
    this.etiquetasSearch.set('');
  }

  onEspecialidadSearchChange(event: any): void {
    this.especialidadesSearch.set(event.target.value);
  }

  onEtiquetaSearchChange(event: any): void {
    this.etiquetasSearch.set(event.target.value);
  }

  addEspecialidad(especialidad: Especialidad): void {
    if (this.isEspecialidadesForCreate()) {
      const especialidades = [...(this.newCategoria().especialidades || [])];
      if (especialidad.id && !especialidades.includes(especialidad.id)) {
        especialidades.push(especialidad.id);
        this.newCategoria.update(data => ({ ...data, especialidades }));
      }
    } else {
      const especialidades = [...(this.editCategoriaData().especialidades || [])];
      if (especialidad.id && !especialidades.includes(especialidad.id)) {
        especialidades.push(especialidad.id);
        this.editCategoriaData.update(data => ({ ...data, especialidades }));
      }
    }
  }

  addEtiqueta(etiqueta: Etiqueta): void {
    if (this.isEtiquetasForCreate()) {
      const etiquetas = [...(this.newCategoria().etiquetas || [])];
      if (etiqueta.id && !etiquetas.includes(etiqueta.id)) {
        etiquetas.push(etiqueta.id);
        this.newCategoria.update(data => ({ ...data, etiquetas }));
      }
    } else {
      const etiquetas = [...(this.editCategoriaData().etiquetas || [])];
      if (etiqueta.id && !etiquetas.includes(etiqueta.id)) {
        etiquetas.push(etiqueta.id);
        this.editCategoriaData.update(data => ({ ...data, etiquetas }));
      }
    }
  }

  removeEspecialidad(especialidadId: number, forCreate: boolean): void {
    if (forCreate) {
      const especialidades = this.newCategoria().especialidades?.filter((id: number) => id !== especialidadId) || [];
      this.newCategoria.update(data => ({ ...data, especialidades }));
    } else {
      const especialidades = this.editCategoriaData().especialidades?.filter((id: number) => id !== especialidadId) || [];
      this.editCategoriaData.update(data => ({ ...data, especialidades }));
    }
  }

  removeEtiqueta(etiquetaId: number, forCreate: boolean): void {
    if (forCreate) {
      const etiquetas = this.newCategoria().etiquetas?.filter((id: number) => id !== etiquetaId) || [];
      this.newCategoria.update(data => ({ ...data, etiquetas }));
    } else {
      const etiquetas = this.editCategoriaData().etiquetas?.filter((id: number) => id !== etiquetaId) || [];
      this.editCategoriaData.update(data => ({ ...data, etiquetas }));
    }
  }

  isEspecialidadSelected(especialidadId: number): boolean {
    if (this.isEspecialidadesForCreate()) {
      return this.newCategoria().especialidades?.includes(especialidadId) || false;
    } else {
      return this.editCategoriaData().especialidades?.includes(especialidadId) || false;
    }
  }

  isEtiquetaSelected(etiquetaId: number): boolean {
    if (this.isEtiquetasForCreate()) {
      return this.newCategoria().etiquetas?.includes(etiquetaId) || false;
    } else {
      return this.editCategoriaData().etiquetas?.includes(etiquetaId) || false;
    }
  }

  getEspecialidadNombre(especialidadId: number): string {
    const especialidad = this.especialidadesList().find(esp => esp.id === especialidadId);
    return especialidad ? especialidad.nombre : 'Especialidad no encontrada';
  }

  getEtiquetaNombre(etiquetaId: number): string {
    const etiqueta = this.etiquetasList().find(etq => etq.id === etiquetaId);
    return etiqueta ? etiqueta.nombre : 'Etiqueta no encontrada';
  }

  deleteCategoria(categoria: Categoria): void {
    if (confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      this.isLoading.set(true);
      this.categoriaService.deleteCategoria(categoria.id!).subscribe({
        next: () => {
          this.loadCategorias();
          this.isLoading.set(false);
          this.notificationService.success('Éxito', 'Categoría eliminada exitosamente', 4000);
        },
        error: (error: any) => {
          console.error('Error eliminando categoría:', error);
          this.isLoading.set(false);
          this.notificationService.error('Error', 'No se pudo eliminar la categoría', 4000);
        }
      });
    }
  }

  openGestionEtiquetaModal(etiqueta?: Etiqueta): void {
    this.etiquetaEditando.set(etiqueta || null);
    if (etiqueta) {
      this.nuevaEtiqueta.set({
        nombre: etiqueta.nombre,
        descripcion: etiqueta.descripcion || ''
      });
    } else {
      this.nuevaEtiqueta.set({ nombre: '', descripcion: '' });
    }
    this.showGestionEtiquetaModal.set(true);
  }

  closeGestionEtiquetaModal(): void {
    this.showGestionEtiquetaModal.set(false);
    this.etiquetaEditando.set(null);
    this.nuevaEtiqueta.set({ nombre: '', descripcion: '' });
  }

  crearEtiqueta(): void {
    const etiquetaData = this.nuevaEtiqueta();

    if (!etiquetaData.nombre) {
      this.notificationService.warning('Formulario incompleto', 'El nombre es requerido', 4000);
      return;
    }

    this.isLoading.set(true);
    this.etiquetaService.createEtiqueta(etiquetaData).subscribe({
      next: (etiquetaCreada) => {
        this.loadEtiquetas();
        this.closeGestionEtiquetaModal();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Etiqueta creada exitosamente', 4000);
      },
      error: (error: any) => {
        console.error('Error creando etiqueta:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo crear la etiqueta', 4000);
      }
    });
  }

  actualizarEtiqueta(): void {
    const etiquetaData = this.nuevaEtiqueta();
    const etiquetaId = this.etiquetaEditando()?.id;

    if (!etiquetaId || !etiquetaData.nombre) {
      this.notificationService.warning('Formulario incompleto', 'El nombre es requerido', 4000);
      return;
    }

    const updateData: UpdateEtiquetaRequest = {
      id: etiquetaId,
      nombre: etiquetaData.nombre,
      descripcion: etiquetaData.descripcion
    };

    this.isLoading.set(true);
    this.etiquetaService.updateEtiqueta(updateData).subscribe({
      next: (etiquetaActualizada) => {
        this.loadEtiquetas();
        this.closeGestionEtiquetaModal();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Etiqueta actualizada exitosamente', 4000);
      },
      error: (error: any) => {
        console.error('Error actualizando etiqueta:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo actualizar la etiqueta', 4000);
      }
    });
  }

  eliminarEtiqueta(etiqueta: Etiqueta): void {
    if (confirm(`¿Estás seguro de eliminar la etiqueta "${etiqueta.nombre}"?`)) {
      this.isLoading.set(true);
      this.etiquetaService.deleteEtiqueta(etiqueta.id!).subscribe({
        next: () => {
          this.loadEtiquetas();
          this.isLoading.set(false);
          this.notificationService.success('Éxito', 'Etiqueta eliminada exitosamente', 4000);
        },
        error: (error: any) => {
          console.error('Error eliminando etiqueta:', error);
          this.isLoading.set(false);
          this.notificationService.error('Error', 'No se pudo eliminar la etiqueta', 4000);
        }
      });
    }
  }

  openGestionEspecialidadModal(especialidad?: Especialidad): void {
    this.especialidadEditando.set(especialidad || null);
    if (especialidad) {
      this.nuevaEspecialidad.set({
        codigo: especialidad.codigo,
        nombre: especialidad.nombre,
        descripcion: especialidad.descripcion || ''
      });
    } else {
      this.nuevaEspecialidad.set({ codigo: '', nombre: '', descripcion: '' });
    }
    this.showGestionEspecialidadModal.set(true);
  }

  closeGestionEspecialidadModal(): void {
    this.showGestionEspecialidadModal.set(false);
    this.especialidadEditando.set(null);
    this.nuevaEspecialidad.set({ codigo: '', nombre: '', descripcion: '' });
  }

  crearEspecialidad(): void {
    const especialidadData = this.nuevaEspecialidad();

    if (!especialidadData.codigo || !especialidadData.nombre) {
      this.notificationService.warning('Formulario incompleto', 'El código y nombre son requeridos', 4000);
      return;
    }

    this.isLoading.set(true);
    this.especialidadService.createEspecialidad(especialidadData).subscribe({
      next: (especialidadCreada) => {
        this.loadEspecialidades();
        this.closeGestionEspecialidadModal();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Especialidad creada exitosamente', 4000);
      },
      error: (error: any) => {
        console.error('Error creando especialidad:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo crear la especialidad', 4000);
      }
    });
  }

  actualizarEspecialidad(): void {
    const especialidadData = this.nuevaEspecialidad();
    const especialidadId = this.especialidadEditando()?.id;

    if (!especialidadId || !especialidadData.codigo || !especialidadData.nombre) {
      this.notificationService.warning('Formulario incompleto', 'El código y nombre son requeridos', 4000);
      return;
    }

    const updateData: UpdateEspecialidadRequest = {
      id: especialidadId,
      codigo: especialidadData.codigo,
      nombre: especialidadData.nombre,
      descripcion: especialidadData.descripcion
    };

    this.isLoading.set(true);
    this.especialidadService.updateEspecialidad(updateData).subscribe({
      next: (especialidadActualizada) => {
        this.loadEspecialidades();
        this.closeGestionEspecialidadModal();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Especialidad actualizada exitosamente', 4000);
      },
      error: (error: any) => {
        console.error('Error actualizando especialidad:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo actualizar la especialidad', 4000);
      }
    });
  }

  eliminarEspecialidad(especialidad: Especialidad): void {
    if (confirm(`¿Estás seguro de eliminar la especialidad "${especialidad.nombre}"?`)) {
      this.isLoading.set(true);
      this.especialidadService.deleteEspecialidad(especialidad.id!).subscribe({
        next: () => {
          this.loadEspecialidades();
          this.isLoading.set(false);
          this.notificationService.success('Éxito', 'Especialidad eliminada exitosamente', 4000);
        },
        error: (error: any) => {
          console.error('Error eliminando especialidad:', error);
          this.isLoading.set(false);
          this.notificationService.error('Error', 'No se pudo eliminar la especialidad', 4000);
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