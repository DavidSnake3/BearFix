import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AsignacionService } from '../../../share/services/api/asignacion.service';


interface DiaCalendario {
  fecha: Date;                    // Fecha del día
  numero: number;                 // Número del día (1-31)
  esMesActual: boolean;           // Si pertenece al mes actual
  asignaciones: any[];           // Lista de asignaciones del día
  tieneAsignaciones: boolean;    // Si tiene asignaciones
  cantidadAsignaciones: number;  // Cantidad total de asignaciones
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

  fechaActual = signal<Date>(new Date());
  // Signal que almacena la fecha actual, se inicializa con la fecha del sistema
  mesActual = signal<number>(this.fechaActual().getMonth());
  // Signal que almacena el mes actual, se obtiene de fechaActual
  anioActual = signal<number>(this.fechaActual().getFullYear());
  // Signal que almacena el año actual, se obtiene de fechaActual
  semanas = signal<DiaCalendario[][]>([]);
  // Signal que almacena un array bidimensional de semanas, cada semana es un array de días
  asignaciones = signal<any[]>([]);
  // Signal que almacena todas las asignaciones cargadas
  mostrarModal = signal<boolean>(false);
  // Signal que controla si el modal está visible o no
  asignacionesDiaSeleccionado = signal<any[]>([]);
  // Signal que almacena las asignaciones del día seleccionado
  fechaSeleccionada = signal<string>('');
  // Signal que almacena la fecha formateada del día seleccionado


  diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  ngOnInit(): void {
    this.cargarAsignaciones();
  }

  cargarAsignaciones(): void {
    this.asignacionService.getMisAsignaciones().subscribe({
      next: (data) => {
        this.asignaciones.set(data);        // Guarda las asignaciones en el signal
        this.generarCalendario();          // Genera el calendario con los datos
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
      }
    });
  }

  generarCalendario(): void {
    const semanas: DiaCalendario[][] = [];  // Array para almacenar todas las semanas
    const primerDiaMes = new Date(this.anioActual(), this.mesActual(), 1);  // Crea la fecha del primer día del mes actual
    const ultimoDiaMes = new Date(this.anioActual(), this.mesActual() + 1, 0); // Crea la fecha del último día del mes actual (día 0 del siguiente mes)
    const primerDiaSemana = primerDiaMes.getDay();  // Obtiene el día de la semana del primer día (0=domingo, 1=lunes, etc.)

    const diasMesAnterior = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    //  Calcula cuántos días del mes anterior mostrar
    // - Si el primer día es domingo (0), muestra 6 días del mes anterior
    // - En otro caso, muestra (día-1) días del mes anterior

    const ultimoDiaMesAnterior = new Date(this.anioActual(), this.mesActual(), 0).getDate();
    // Obtiene el último día del mes anterior

    let semanaActual: DiaCalendario[] = []; // Array temporal para la semana en construcción

    // Agrega días del mes anterior
    for (let i = diasMesAnterior; i > 0; i--) {
      const diaMesAnterior = ultimoDiaMesAnterior - i + 1;
      // Calcula el día específico del mes anterior
      const fecha = new Date(this.anioActual(), this.mesActual() - 1, diaMesAnterior);
      // Crea la fecha del día del mes anterior
      semanaActual.push(this.crearDiaCalendario(fecha, false));
      // Agrega el día al array de la semana actual (esMesActual = false)
    }

    // FOR: Agrega todos los días del mes actual
    for (let dia = 1; dia <= ultimoDiaMes.getDate(); dia++) {
      const fecha = new Date(this.anioActual(), this.mesActual(), dia);
      // Crea la fecha del día actual del mes

      semanaActual.push(this.crearDiaCalendario(fecha, true));
      // Agrega el día al array de la semana actual (esMesActual = true)

      // Cuando se completa una semana (7 días)
      if (semanaActual.length === 7) {
        semanas.push(semanaActual);  // Agrega la semana completa al array de semanas
        semanaActual = [];           // Reinicia el array para la siguiente semana
      }
    }

    // Si quedan días sin completar la última semana
    if (semanaActual.length > 0) {
      let diaSiguienteMes = 1;

      // Completa la última semana con días del siguiente mes
      while (semanaActual.length < 7) {
        const fecha = new Date(this.anioActual(), this.mesActual() + 1, diaSiguienteMes);
        semanaActual.push(this.crearDiaCalendario(fecha, false));
        diaSiguienteMes++;  // Incrementa el contador de días del siguiente mes
      }
      semanas.push(semanaActual);  // Agrega la última semana completada
    }

    this.semanas.set(semanas);  // Actualiza el signal con el calendario generado
  }

  crearDiaCalendario(fecha: Date, esMesActual: boolean): DiaCalendario {
    //Filtra las asignaciones que coinciden con la fecha
    const asignacionesDia = this.asignaciones().filter(asignacion => {
      const fechaAsignacion = new Date(asignacion.fechaAsignacion);
      return fechaAsignacion.toDateString() === fecha.toDateString();
      // Compara si las fechas son el mismo día (ignorando hora)
    });

    return {
      fecha,
      numero: fecha.getDate(),
      esMesActual,
      asignaciones: asignacionesDia,
      tieneAsignaciones: asignacionesDia.length > 0,  // true si hay asignaciones
      cantidadAsignaciones: asignacionesDia.length
    };
  }

  mesAnterior(): void {
    this.mesActual.update(mes => {
      let nuevoMes = mes - 1;  // Decrementa el mes
      let nuevoAnio = this.anioActual();

      // Si el nuevo mes es menor que 0 (diciembre del año anterior)
      if (nuevoMes < 0) {
        nuevoMes = 11;         // Establece diciembre
        nuevoAnio--;           // Decrementa el año
      }

      this.anioActual.set(nuevoAnio);  // Actualiza el año
      return nuevoMes;         // Retorna el nuevo mes
    });
    this.generarCalendario();  // Regenera el calendario con el nuevo mes
  }

  mesSiguiente(): void {
    this.mesActual.update(mes => {
      let nuevoMes = mes + 1;  // Incrementa el mes
      let nuevoAnio = this.anioActual();

      // Si el nuevo mes es mayor que 11 (enero del siguiente año)
      if (nuevoMes > 11) {
        nuevoMes = 0;          // Establece enero
        nuevoAnio++;           // Incrementa el año
      }

      this.anioActual.set(nuevoAnio);  // Actualiza el año
      return nuevoMes;         // Retorna el nuevo mes
    });
    this.generarCalendario();  // Regenera el calendario con el nuevo mes
  }

  abrirModalDia(dia: DiaCalendario): void {
    // Solo abre el modal si el día tiene asignaciones
    if (dia.tieneAsignaciones) {
      this.asignacionesDiaSeleccionado.set(dia.asignaciones);
      // Guarda las asignaciones del día seleccionado

      this.fechaSeleccionada.set(dia.fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
      // Formatea la fecha en español (ej: "lunes, 1 de enero de 2024")

      this.mostrarModal.set(true);  // Muestra el modal
    }
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);           // Oculta el modal
    this.asignacionesDiaSeleccionado.set([]); // Limpia las asignaciones del modal
  }

  verDetalleAsignacion(id: number): void {

    //  Validación del ID
    if (!id || id === 0) {
      alert('Error: No se puede cargar el detalle. ID no válido.');
      return;  // Sale de la función si el ID no es válido
    }

    this.cerrarModal();  // Cierra el modal

    this.router.navigate(['/asignaciones/detalle', id]).then(success => {
    }).catch(error => {
    });
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
    //  Cuenta días del mes actual con asignaciones
    return this.semanas().reduce((total, semana) => {
      return total + semana.filter(dia => dia.tieneAsignaciones && dia.esMesActual).length;
      // Filtra días que tienen asignaciones y son del mes actual
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