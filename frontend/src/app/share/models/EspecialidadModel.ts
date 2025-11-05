export interface Especialidad {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  
  usuarios?: any[];
  categoriaEspecialidades?: any[];
  reglasAutotriage?: any[];
}

export interface CreateEspecialidadDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}