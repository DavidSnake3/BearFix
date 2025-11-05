import { TicketEstado, ModoAsignacion, Prioridad } from "./EnumsModel";


export interface Ticket {
  id: number;
  consecutivo: string;
  titulo: string;
  descripcion?: string;
  solicitanteId?: number;
  categoriaId?: number;
  estado: TicketEstado;
  modoAsignacion: ModoAsignacion;
  prioridad?: Prioridad;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaLimiteRespuesta?: Date;
  fechaLimiteResolucion?: Date;
  fechaRespuesta?: Date;
  fechaCierre?: Date;
  eliminadoLogico: boolean;
  diasResolucion?: number;
  
  puntajePrioridad?: number;
  tiempoRestanteSLAHoras?: number;

  solicitante?: any;
  categoria?: any;
  asignaciones?: any[];
  historial?: any[];
  valoracion?: any;
  imagenes?: any[];
}

export interface CreateTicketDto {
  titulo: string;
  descripcion?: string;
  solicitanteId?: number;
  categoriaId?: number;
  prioridad?: Prioridad;
  fechaLimiteRespuesta?: Date;
  fechaLimiteResolucion?: Date;
}