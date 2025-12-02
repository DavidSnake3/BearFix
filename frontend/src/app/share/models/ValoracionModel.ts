import { Ticket } from "./TicketModel";
import { Usuario } from "./UsuarioModel";

export interface Valoracion {
  id: number;
  ticketId: number;
  usuarioId: number;
  puntuacion: number;
  comentario?: string;
  creadoEn: Date;
  actualizadoEn: Date;
  
  usuario?: {
    nombre: string;
    correo: string;
  };
  ticket?: {
    consecutivo: string;
    titulo: string;
    estado?: string;
  };
}

export interface CreateValoracionRequest {
  ticketId: number;
  puntuacion: number;
  comentario?: string;
}

export interface PromedioValoracionTecnico {
  tecnicoId: number;
  promedio: number;
  totalValoraciones: number;
}