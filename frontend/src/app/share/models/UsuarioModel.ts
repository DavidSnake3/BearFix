import { Role } from "./EnumsModel";



export interface Usuario {
  id: number;
  correo: string;
  contrasenaHash: string;
  nombre?: string;
  telefono?: string;
  rol: Role;
  activo: boolean;
  ultimoInicio?: Date;
  disponible?: boolean;
  cargosActuales?: number;
  limiteCargaTickets?: number;
  ultimaActualizacion?: Date;
  creadoEn: Date;
  actualizadoEn: Date;
  
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;

  solicitudes?: any[];
  asignacionesRecibidas?: any[];
  asignacionesHechas?: any[];
  usuarioEspecialidades?: any[];
  ticketHistorial?: any[];
  notificacionesRemitente?: any[];
  notificacionesDestino?: any[];
  valoraciones?: any[];
  imagenesSubidas?: any[];
}

export interface CreateUsuarioDto {
  correo: string;
  contrasenaHash: string;
  nombre?: string;
  telefono?: string;
  rol: Role;
  disponible?: boolean;
  limiteCargaTickets?: number;
}