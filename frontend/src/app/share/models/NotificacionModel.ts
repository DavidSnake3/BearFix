import { NotifTipo, NotifPrioridad } from "./EnumsModel";
import { Usuario } from "./UsuarioModel";

export interface Notificacion {
  id: number;
  tipo: NotifTipo;
  remitenteId?: number;
  destinatarioId: number;
  asunto?: string;
  mensaje?: string;
  datos?: any; // JSON
  leida: boolean;
  prioridad: NotifPrioridad;
  creadoEn: Date;
  
  remitente?: Usuario;
  destinatario?: Usuario;
}

export interface CreateNotificacionDto {
  tipo: NotifTipo;
  remitenteId?: number;
  destinatarioId: number;
  asunto?: string;
  mensaje?: string;
  datos?: any;
  prioridad?: NotifPrioridad;
  leida?: boolean;
}