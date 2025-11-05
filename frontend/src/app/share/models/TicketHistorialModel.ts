import { TicketEstado } from "./EnumsModel";


export interface TicketHistorial {
  id: number;
  ticketId: number;
  estadoOrigen?: TicketEstado;
  estadoDestino: TicketEstado;
  usuarioId?: number;
  observaciones?: string;
  creadoEn: Date;
  
  ticket?: any;
  usuario?: any;
}

export interface CreateTicketHistorialDto {
  ticketId: number;
  estadoOrigen?: TicketEstado;
  estadoDestino: TicketEstado;
  usuarioId?: number;
  observaciones?: string;
}