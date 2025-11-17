import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { TecnicoService } from '../../../share/services/api/tecnico.service';
import { Usuario } from '../../../share/models/UsuarioModel';
import { EspecialidadService } from '../../../share/services/api/especialidad.service';
import { Especialidad } from '../../../share/models/EspecialidadModel';
import { CreateTecnicoRequest, UpdateTecnicoRequest } from '../../../share/models/tecnico.model';
import { NotificationService } from '../../../share/services/app/notification.service';

@Component({
  selector: 'app-tecnicos',
  templateUrl: './tecnicos.html',
  styleUrls: ['./tecnicos.css'],
  standalone: false
})
export class TecnicosComponent implements OnInit, OnDestroy {
  private tecnicoService = inject(TecnicoService);
  private especialidadService = inject(EspecialidadService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  especialidadesList = signal<Especialidad[]>([]);

  tecnicos = signal<Usuario[]>([]);
  selectedTecnico = signal<any>(null);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  editTecnicoData = signal<any>(null);
  originalTecnico = signal<any>(null);

  // Señales para crear técnico
  showCreateModal = signal(false);
  newTecnico = signal<CreateTecnicoRequest>({
    nombre: '',
    correo: '',
    telefono: '',
    disponible: true,
    limiteCargaTickets: 5,
    especialidades: []
  });

  // Señales para el modal de especialidades
  showEspecialidadesModal = signal(false);
  isEspecialidadesForCreate = signal(false);
  especialidadesSearch = signal('');
  especialidadesFiltradas = computed(() => {
    const search = this.especialidadesSearch().toLowerCase();
    return this.especialidadesList().filter(esp =>
      esp.nombre.toLowerCase().includes(search) ||
      (esp.descripcion && esp.descripcion.toLowerCase().includes(search))
    );
  });

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

  especialidadesTabActive = signal<'select' | 'manage'>('select');
  showGestionEspecialidadModal = signal(false);
  especialidadEditando = signal<Especialidad | null>(null);
  nuevaEspecialidad = signal({ codigo: '', nombre: '', descripcion: '' });

  openEspecialidadesModal(forCreate: boolean): void {
    this.isEspecialidadesForCreate.set(forCreate);
    this.showEspecialidadesModal.set(true);
    this.especialidadesSearch.set('');
    this.especialidadesTabActive.set('select'); // Reset a la pestaña de selección
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
      error: (error) => {
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

    const updateData = {
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
      error: (error) => {
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
        error: (error) => {
          console.error('Error eliminando especialidad:', error);
          this.isLoading.set(false);
          this.notificationService.error('Error', 'No se pudo eliminar la especialidad', 4000);
        }
      });
    }
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadTecnicos();
    this.loadEspecialidades();
  }

  private loadEspecialidades(): void {
    this.especialidadService.get().subscribe({
      next: (especialidades) => {
        this.especialidadesList.set(especialidades);
      },
      error: (error) => {
        console.error('Error cargando especialidades:', error);
        this.notificationService.error('Error', 'No se pudieron cargar las especialidades', 4000);
      }
    });
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
        this.notificationService.error('Error', 'No se pudieron cargar los técnicos', 4000);
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
    this.tecnicoService.getById(tecnico.id).subscribe({
      next: (detail) => {
        this.selectedTecnico.set(detail);
        this.showModal.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle del técnico:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo cargar el detalle del técnico', 4000);
      }
    });
  }

  enableEditMode(tecnico: Usuario): void {
    this.isLoading.set(true);
    this.tecnicoService.getById(tecnico.id).subscribe({
      next: (detail) => {
        this.selectedTecnico.set(detail);
        this.showModal.set(true);
        this.enableEdit();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando detalle del técnico:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo cargar el detalle del técnico', 4000);
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

  saveTecnico(): void {
    const tecnicoData = this.editTecnicoData();

    if (!tecnicoData?.nombre || !tecnicoData?.correo) {
      this.notificationService.warning(
        'Formulario incompleto',
        'Por favor completa todos los campos requeridos correctamente',
        4000
      );
      return;
    }

    const updateData: UpdateTecnicoRequest = {
      id: tecnicoData.id,
      nombre: tecnicoData.nombre,
      correo: tecnicoData.correo,
      telefono: tecnicoData.telefono,
      disponible: tecnicoData.disponible,
      limiteCargaTickets: tecnicoData.limiteCargaTickets,
      especialidades: tecnicoData.especialidades || []
    };

    this.isLoading.set(true);
    this.tecnicoService.updateTecnico(updateData).subscribe({
      next: (tecnicoActualizado) => {
        this.selectedTecnico.set(tecnicoActualizado);
        this.isEditing.set(false);
        this.originalTecnico.set(null);
        this.editTecnicoData.set(null);
        this.loadTecnicos();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Técnico actualizado exitosamente', 4000);
      },
      error: (error) => {
        console.error('Error actualizando técnico:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo actualizar el técnico', 4000);
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.isEditing.set(false);
    this.selectedTecnico.set(null);
    this.originalTecnico.set(null);
    this.editTecnicoData.set(null);
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
    this.newTecnico.set({
      nombre: '',
      correo: '',
      telefono: '',
      disponible: true,
      limiteCargaTickets: 5,
      especialidades: []
    });
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createTecnico(): void {
    const tecnicoData = this.newTecnico();

    if (!tecnicoData.nombre || !tecnicoData.correo) {
      this.notificationService.warning(
        'Formulario incompleto',
        'Por favor completa todos los campos requeridos correctamente',
        4000
      );
      return;
    }

    this.isLoading.set(true);
    this.tecnicoService.createTecnico(tecnicoData).subscribe({
      next: (tecnicoCreado) => {
        this.showCreateModal.set(false);
        this.loadTecnicos();
        this.isLoading.set(false);
        this.notificationService.success('Éxito', 'Técnico creado exitosamente', 4000);
      },
      error: (error) => {
        console.error('Error creando técnico:', error);
        this.isLoading.set(false);
        this.notificationService.error('Error', 'No se pudo crear el técnico', 4000);
      }
    });
  }

  closeEspecialidadesModal(): void {
    this.showEspecialidadesModal.set(false);
    this.especialidadesSearch.set('');
  }

  onEspecialidadSearchChange(event: any): void {
    this.especialidadesSearch.set(event.target.value);
  }

  addEspecialidad(especialidad: Especialidad): void {
    if (this.isEspecialidadesForCreate()) {
      const especialidades = [...(this.newTecnico().especialidades || [])];
      if (especialidad.id && !especialidades.includes(especialidad.id)) {
        especialidades.push(especialidad.id);
        this.newTecnico.update(data => ({ ...data, especialidades }));
      }
    } else {
      const especialidades = [...(this.editTecnicoData().especialidades || [])];
      if (especialidad.id && !especialidades.includes(especialidad.id)) {
        especialidades.push(especialidad.id);
        this.editTecnicoData.update(data => ({ ...data, especialidades }));
      }
    }
  }

  removeEspecialidad(especialidadId: number, forCreate: boolean): void {
    if (forCreate) {
      const especialidades = this.newTecnico().especialidades?.filter((id: number) => id !== especialidadId) || [];
      this.newTecnico.update(data => ({ ...data, especialidades }));
    } else {
      const especialidades = this.editTecnicoData().especialidades?.filter((id: number) => id !== especialidadId) || [];
      this.editTecnicoData.update(data => ({ ...data, especialidades }));
    }
  }
  isEspecialidadSelected(especialidadId: number): boolean {
    if (this.isEspecialidadesForCreate()) {
      return this.newTecnico().especialidades?.includes(especialidadId) || false;
    } else {
      return this.editTecnicoData().especialidades?.includes(especialidadId) || false;
    }
  }

  getEspecialidadNombre(especialidadId: number): string {
    const especialidad = this.especialidadesList().find(esp => esp.id === especialidadId);
    return especialidad ? especialidad.nombre : 'Especialidad no encontrada';
  }

  deleteTecnico(tecnico: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar al técnico "${tecnico.nombre}"?`)) {
      this.isLoading.set(true);
      this.tecnicoService.deleteTecnico(tecnico.id).subscribe({
        next: () => {
          this.loadTecnicos();
          this.isLoading.set(false);
          this.notificationService.success('Éxito', 'Técnico eliminado exitosamente', 4000);
        },
        error: (error) => {
          console.error('Error eliminando técnico:', error);
          this.isLoading.set(false);
          this.notificationService.error('Error', 'No se pudo eliminar el técnico', 4000);
        }
      });
    }
  }

  getWorkloadPercentage(current: number | undefined, limit: number | undefined): number {
    if (!limit || limit === 0 || !current) return 0;
    const percentage = (current / limit) * 100;
    return Math.min(percentage, 100);
  }

  getWorkloadClass(current: number | undefined, limit: number | undefined): string {
    if (!limit || limit === 0 || !current) return 'low';
    const percentage = current / limit;
    if (percentage < 0.7) return 'low';
    if (percentage < 1) return 'medium';
    return 'high';
  }

  getPrioridadBadgeClass(prioridad: string | undefined): string {
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

  getEstadoBadgeClass(estado: string | undefined): string {
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