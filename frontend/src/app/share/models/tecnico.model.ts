// tecnico.model.ts
export interface CreateTecnicoRequest {
  nombre: string;
  correo: string;
  telefono?: string;
  disponible?: boolean;
  limiteCargaTickets?: number;
  especialidades?: number[];
  contrasena?: string;
}

export interface UpdateTecnicoRequest {
  id: number;
  nombre?: string;
  correo?: string;
  telefono?: string;
  disponible?: boolean;
  limiteCargaTickets?: number;
  especialidades?: number[];
  contrasena?: string;
}