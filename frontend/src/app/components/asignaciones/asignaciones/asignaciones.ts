import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AsignacionService } from '../../../share/services/api/asignacion.service';
import { AsignacionManualService, TecnicoDisponible, TicketPendiente } from '../../../share/services/api/asignacion-manual.service';
import { AutotriageService, ResultadoAutotriage } from '../../../share/services/api/autotriage.service';
import { NotificationService } from '../../../share/services/app/notification.service';
import { AuthService } from '../../../share/services/api/auth.service';
import { lastValueFrom } from 'rxjs';

interface DiaCalendario {
  fecha: Date;
  numero: number;
  esMesActual: boolean;
  asignaciones: any[];
  tieneAsignaciones: boolean;
  cantidadAsignaciones: number;
}

@Component({
  selector: 'app-asignaciones',
  templateUrl: './asignaciones.html',
  styleUrls: ['./asignaciones.css'],
  standalone: false
})
export class AsignacionesComponent {
  private asignacionService = inject(AsignacionService);
  private router = inject(Router);
  private asignacionManualService = inject(AsignacionManualService);
  private autotriageService = inject(AutotriageService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  showModal = signal(false);
  modoAsignacion = signal<'automatica' | 'manual' | null>(null);

  ticketsPendientes = signal<TicketPendiente[]>([]);
  tecnicosDisponibles = signal<TecnicoDisponible[]>([]);
  selectedTicketId = signal<number | null>(null);
  selectedTecnicoId = signal<number | null>(null);
  justificacion = signal('');

  resultadosAutotriage = signal<ResultadoAutotriage[]>([]);
  estadisticasAutotriage = signal<any>(null);

  isLoading = signal(false);
  isLoadingTickets = signal(false);
  isLoadingTecnicos = signal(false);
  isLoadingAutotriage = signal(false);

  fechaActual = signal<Date>(new Date());
  mesActual = signal<number>(this.fechaActual().getMonth());
  anioActual = signal<number>(this.fechaActual().getFullYear());
  semanas = signal<DiaCalendario[][]>([]);
  asignaciones = signal<any[]>([]);
  mostrarModal = signal<boolean>(false);
  asignacionesDiaSeleccionado = signal<any[]>([]);
  fechaSeleccionada = signal<string>('');

  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  esAdministrador = signal<boolean>(false);

  ngOnInit(): void {
    this.verificarPermisos();
    this.cargarAsignaciones();
    this.cargarEstadisticasAutotriage();
  }

  private verificarPermisos(): void {
    const userRole = this.authService.getRoleFromToken();
    this.esAdministrador.set(userRole === 'ADM');
    
    if (userRole !== 'ADM' && this.showModal()) {
      this.closeModal();
    }
  }

  async cargarEstadisticasAutotriage(): Promise<void> {
    if (!this.esAdministrador()) return;

    try {
      const response = await this.autotriageService.obtenerEstadisticas().toPromise();
      if (response?.success) {
        this.estadisticasAutotriage.set(response.data);
      }
    } catch (error) {}
  }

  closeModal(): void {
    this.showModal.set(false);
    this.modoAsignacion.set(null);
    this.selectedTicketId.set(null);
    this.selectedTecnicoId.set(null);
    this.justificacion.set('');
    this.resultadosAutotriage.set([]);
  }

  async cargarDatosAsignacionManual(): Promise<void> {
    if (!this.esAdministrador()) {
      return;
    }

    this.isLoadingTickets.set(true);
    this.isLoadingTecnicos.set(true);

    try {
      const [ticketsResponse, tecnicosResponse] = await Promise.all([
        this.asignacionManualService.obtenerTicketsPendientes().toPromise(),
        this.asignacionManualService.obtenerTecnicosDisponibles().toPromise()
      ]);

      if (ticketsResponse?.success) {
        this.ticketsPendientes.set(ticketsResponse.data);
      } else {
        this.notificationService.error('Error', 'No se pudieron cargar los tickets pendientes', 4000);
      }

      if (tecnicosResponse?.success) {
        this.tecnicosDisponibles.set(tecnicosResponse.data);
      } else {
        this.notificationService.error('Error', 'No se pudieron cargar los técnicos disponibles', 4000);
      }
    } catch (error) {
      this.notificationService.error('Error', 'Error al cargar datos para asignación manual', 4000);
    } finally {
      this.isLoadingTickets.set(false);
      this.isLoadingTecnicos.set(false);
    }
  }

  async ejecutarAutotriage(): Promise<void> {
    if (!this.esAdministrador()) {
      this.notificationService.warning('Permisos insuficientes', 'Solo los administradores pueden ejecutar autotriage', 4000);
      return;
    }

    this.isLoadingAutotriage.set(true);

    type AutotriageResponse = {
      success: boolean;
      data?: {
        resultados?: ResultadoAutotriage[];
        exitosos?: number;
        fallidos?: number;
      };
    } | undefined;

    try {
      const response = await lastValueFrom(this.autotriageService.ejecutarAutotriage()) as AutotriageResponse;

      if (response?.success) {
        this.resultadosAutotriage.set(response.data?.resultados ?? []);
        this.estadisticasAutotriage.set({
          ticketsPendientes: 0,
          tecnicosDisponibles: this.estadisticasAutotriage()?.tecnicosDisponibles ?? 0
        });

        this.notificationService.success(
          'Éxito',
          `Autotriage completado: ${response.data?.exitosos ?? 0} exitosos, ${response.data?.fallidos ?? 0} fallidos`,
          5000
        );
      } else {
        if (response && !response.success) {
          this.notificationService.warning('Autotriage', 'El autotriage no devolvió resultados exitosos', 4000);
        } else {
          this.notificationService.error('Error', 'No se recibió respuesta del servicio de autotriage', 4000);
        }
      }
    } catch (error: any) {
      this.notificationService.error('Error', error?.error?.message || 'Error al ejecutar autotriage', 4000);
    } finally {
      this.isLoadingAutotriage.set(false);
    }
  }

  async asignarManual(): Promise<void> {
    if (!this.esAdministrador()) {
      this.notificationService.warning('Permisos insuficientes', 'Solo los administradores pueden realizar asignaciones manuales', 4000);
      return;
    }

    if (!this.selectedTicketId() || !this.selectedTecnicoId() || !this.justificacion().trim()) {
      this.notificationService.warning('Validación', 'Debe seleccionar ticket, técnico y escribir una justificación', 4000);
      return;
    }

    this.isLoading.set(true);

    try {
      const response = await this.asignacionManualService.asignarManual(
        this.selectedTicketId()!,
        this.selectedTecnicoId()!,
        this.justificacion()
      ).toPromise();

      if (response?.success) {
        this.notificationService.success('Éxito', 'Ticket asignado manualmente correctamente', 4000);
        this.closeModal();
        this.cargarEstadisticasAutotriage();
      }
    } catch (error: any) {
      this.notificationService.error('Error', error.error?.message || 'Error al asignar ticket manualmente', 4000);
    } finally {
      this.isLoading.set(false);
    }
  }

  onTicketSelected(value: string): void {
    this.selectedTicketId.set(value ? +value : null);
  }

  onTecnicoSelected(value: string): void {
    this.selectedTecnicoId.set(value ? +value : null);
  }

  getTicketSeleccionado(): any {
    if (!this.selectedTicketId()) return undefined;
    return this.ticketsPendientes().find(t => t.id === this.selectedTicketId());
  }

  getTecnicoSeleccionado(): any {
    if (!this.selectedTecnicoId()) return undefined;
    return this.tecnicosDisponibles().find(t => t.id === this.selectedTecnicoId());
  }

  getEspecialidadesTecnico(): string {
    const tecnico = this.getTecnicoSeleccionado();
    if (!tecnico || !tecnico.especialidades) return 'Sin especialidades';
    return tecnico.especialidades.map((e: any) => e.nombre).join(', ');
  }

  getColorPrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'CRITICO': return 'danger';
      case 'ALTO': return 'warning';
      case 'MEDIO': return 'info';
      case 'BAJO': return 'success';
      default: return 'secondary';
    }
  }

 abrirModalAsignacion(modo: 'automatica' | 'manual'): void {
    if (!this.esAdministrador()) {
      this.notificationService.warning('Permisos insuficientes', 'Solo los administradores pueden realizar asignaciones', 4000);
      return;
    }

    this.modoAsignacion.set(modo);
    this.showModal.set(true);

    if (modo === 'manual') {
      this.cargarDatosAsignacionManual();
    } else if (modo === 'automatica') {
      this.cargarEstadisticasAutotriage();
    }
  }

  cargarAsignaciones(): void {
    this.asignacionService.getMisAsignaciones().subscribe({
      next: (data) => {
        this.asignaciones.set(data);
        this.generarCalendario();
      },
      error: (error) => {
        this.notificationService.error('Error', 'No se pudieron cargar las asignaciones', 4000);
      }
    });
  }

  generarCalendario(): void {
    const semanas: DiaCalendario[][] = [];
    const primerDiaMes = new Date(this.anioActual(), this.mesActual(), 1);
    const ultimoDiaMes = new Date(this.anioActual(), this.mesActual() + 1, 0);
    const primerDiaSemana = primerDiaMes.getDay();
    const diasMesAnterior = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const ultimoDiaMesAnterior = new Date(this.anioActual(), this.mesActual(), 0).getDate();

    let semanaActual: DiaCalendario[] = [];

    for (let i = diasMesAnterior; i > 0; i--) {
      const diaMesAnterior = ultimoDiaMesAnterior - i + 1;
      const fecha = new Date(this.anioActual(), this.mesActual() - 1, diaMesAnterior);
      semanaActual.push(this.crearDiaCalendario(fecha, false));
    }

    for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
      const fecha = new Date(this.anioActual(), this.mesActual(), dia);
      semanaActual.push(this.crearDiaCalendario(fecha, true));

      if (semanaActual.length === 7) {
        semanas.push(semanaActual);
        semanaActual = [];
      }
    }

    if (semanaActual.length > 0) {
      let diaSiguienteMes = 1;
      while (semanaActual.length < 7) {
        const fecha = new Date(this.anioActual(), this.mesActual() + 1, diaSiguienteMes);
        semanaActual.push(this.crearDiaCalendario(fecha, false));
        diaSiguienteMes++;
      }
      semanas.push(semanaActual);
    }

    this.semanas.set(semanas);
  }

  crearDiaCalendario(fecha: Date, esMesActual: boolean): DiaCalendario {
    const asignacionesDia = this.asignaciones().filter(asignacion => {
      const fechaAsignacion = new Date(asignacion.fechaAsignacion);
      return fechaAsignacion.toDateString() === fecha.toDateString();
    });

    return {
      fecha,
      numero: fecha.getDate(),
      esMesActual,
      asignaciones: asignacionesDia,
      tieneAsignaciones: asignacionesDia.length > 0,
      cantidadAsignaciones: asignacionesDia.length
    };
  }

  mesAnterior(): void {
    this.mesActual.update(mes => {
      let nuevoMes = mes - 1;
      let nuevoAnio = this.anioActual();

      if (nuevoMes < 0) {
        nuevoMes = 11;
        nuevoAnio--;
      }

      this.anioActual.set(nuevoAnio);
      return nuevoMes;
    });
    this.generarCalendario();
  }

  mesSiguiente(): void {
    this.mesActual.update(mes => {
      let nuevoMes = mes + 1;
      let nuevoAnio = this.anioActual();

      if (nuevoMes > 11) {
        nuevoMes = 0;
        nuevoAnio++;
      }

      this.anioActual.set(nuevoAnio);
      return nuevoMes;
    });
    this.generarCalendario();
  }

  abrirModalDia(dia: DiaCalendario): void {
    if (dia.tieneAsignaciones) {
      this.asignacionesDiaSeleccionado.set(dia.asignaciones);
      this.fechaSeleccionada.set(dia.fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
      this.mostrarModal.set(true);
    }
  }

  getPrioridadBadgeClass(prioridad: string): string {
    switch (prioridad?.toUpperCase()) {
      case 'CRITICO': return 'bg-danger';
      case 'ALTO': return 'bg-warning';
      case 'MEDIO': return 'bg-info';
      case 'BAJO': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.asignacionesDiaSeleccionado.set([]);
  }

  verDetalleAsignacion(id: number): void {
    if (!id || id === 0) {
      alert('Error: No se puede cargar el detalle. ID no válido.');
      return;
    }

    this.cerrarModal();
    this.router.navigate(['asignaciones/detalle', id]);
  }
  verDetalleGestion(id: number): void {
    if (!id || id === 0) {
      alert('Error: No se puede cargar el detalle. ID no válido.');
      return;
    }

    this.cerrarModal();
    this.router.navigate(['/tickets/gestion', id]);
  }

  getNombreMes(): string {
    return this.meses[this.mesActual()];
  }

  obtenerClasePrioridad(prioridad: string): string {
    switch (prioridad?.toUpperCase()) {
      case 'ALTO': return 'prioridad-alto';
      case 'MEDIO': return 'prioridad-medio';
      case 'BAJO': return 'prioridad-bajo';
      default: return 'prioridad-default';
    }
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  getTotalAsignaciones(): number {
    return this.asignaciones().length;
  }

  getSemanasMes(): number {
    return this.semanas().length;
  }

  getDiasConAsignaciones(): number {
    return this.semanas().reduce((total, semana) => {
      return total + semana.filter(dia => dia.tieneAsignaciones && dia.esMesActual).length;
    }, 0);
  }

  getAbreviaturaDia(diaCompleto: string): string {
    return diaCompleto.charAt(0);
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear();
  }

  obtenerClasePrioridadPrimerTicket(dia: DiaCalendario): string {
    if (!dia.tieneAsignaciones) return 'prioridad-default';
    return this.obtenerClasePrioridad(dia.asignaciones[0]?.prioridad);
  }
}