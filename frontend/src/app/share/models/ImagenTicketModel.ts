import { Ticket } from "./TicketModel";
import { Usuario } from "./UsuarioModel";


export interface ImagenTicket {
  id: number;
  ticketId: number;
  nombreArchivo: string;
  url: string;
  tipo?: string;
  tamaño?: number;
  descripcion?: string;
  creadoEn: Date;
  actualizadoEn: Date;
  
  ticket?: Ticket;
  subidoPorId?: number;
  subidoPor?: Usuario;
}

export interface CreateImagenTicketDto {
  ticketId: number;
  nombreArchivo: string;
  url: string;
  tipo?: string;
  tamaño?: number;
  descripcion?: string;
  subidoPorId?: number;
}