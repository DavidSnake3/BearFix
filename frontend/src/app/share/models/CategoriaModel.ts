import { Prioridad } from "./EnumsModel";

export interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  
  slaNombre?: string;
  slaTiempoMaxRespuestaMin?: number;
  slaTiempoMaxResolucionMin?: number;
  slaDescripcion?: string;
  slaNivelUrgencia?: Prioridad;

  categoriaEtiquetas?: any[];
  categoriaEspecialidades?: any[];
  tickets?: any[];
  reglasAutotriage?: any[];
}

export interface CreateCategoriaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
  slaNombre?: string;
  slaTiempoMaxRespuestaMin?: number;
  slaTiempoMaxResolucionMin?: number;
  slaDescripcion?: string;
  slaNivelUrgencia?: Prioridad;
}