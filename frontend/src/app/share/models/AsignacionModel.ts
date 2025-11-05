import { ModoAsignacion } from "./EnumsModel";
import { ReglaAutotriage } from "./ReglaAutotriageModel";
import { Ticket } from "./TicketModel";
import { Usuario } from "./UsuarioModel";



export interface Asignacion {
  id: number;
  ticketId: number;
  tecnicoId?: number;
  metodo: ModoAsignacion;
  justificacion?: string;
  asignadoPorId?: number;
  reglaAutotriageId?: number;
  puntajeCalculado?: number;
  tiempoRestanteSLAHoras?: number;
  fechaAsignacion: Date;
  activo: boolean;
  
  ticket?: Ticket;
  tecnico?: Usuario;
  asignadoPor?: Usuario;
  reglaAutotriage?: ReglaAutotriage;
}

export interface CreateAsignacionDto {
  ticketId: number;
  tecnicoId?: number;
  metodo: ModoAsignacion;
  justificacion?: string;
  asignadoPorId?: number;
  reglaAutotriageId?: number;
  puntajeCalculado?: number;
  tiempoRestanteSLAHoras?: number;
  activo?: boolean;
}