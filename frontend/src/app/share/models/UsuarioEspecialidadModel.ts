import { Especialidad } from "./EspecialidadModel";
import { Usuario } from "./UsuarioModel";


export interface UsuarioEspecialidad {
  usuarioId: number;
  especialidadId: number;
  creadoEn: Date;
  
  usuario?: Usuario;
  especialidad?: Especialidad;
}

export interface CreateUsuarioEspecialidadDto {
  usuarioId: number;
  especialidadId: number;
}