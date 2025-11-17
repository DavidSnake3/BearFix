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

export interface CreateTicketRequest {
  titulo: string;
  descripcion?: string;
  categoriaId: number;
  etiquetaId: number;
  prioridad?: string;
}

export interface UpdateTicketRequest {
  id: number;
  titulo: string;
  descripcion?: string;
  categoriaId: number;
  etiquetaId: number;
  prioridad?: string;
  estado?: string;
  observacionesCambioEstado?: string;
}

export interface CategoriaConEtiquetas {
  id: number;
  nombre: string;
  descripcion?: string;
  etiquetas: Etiqueta[];
}

export interface Etiqueta {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

export interface Usuario {
  id: number;
  nombre?: string;
  correo: string;
  rol: string;
}