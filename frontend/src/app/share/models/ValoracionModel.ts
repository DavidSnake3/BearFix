import { Ticket } from "./TicketModel";
import { Usuario } from "./UsuarioModel";

export interface Valoracion {
  id: number;
  ticketId: number;
  usuarioId?: number;
  puntuacion: number;
  comentario?: string;
  creadoEn: Date;
  
  ticket?: Ticket;
  usuario?: Usuario;
}

export interface CreateValoracionDto {
  ticketId: number;
  usuarioId?: number;
  puntuacion: number;
  comentario?: string;
}