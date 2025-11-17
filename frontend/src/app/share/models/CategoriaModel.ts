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

export interface CreateCategoriaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  slaNombre?: string;
  slaTiempoMaxRespuestaMin?: number;
  slaTiempoMaxResolucionMin?: number;
  slaDescripcion?: string;
  slaNivelUrgencia?: Prioridad;
  etiquetas?: number[];
  especialidades?: number[];
}

export interface UpdateCategoriaRequest {
  id: number;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  slaNombre?: string;
  slaTiempoMaxRespuestaMin?: number;
  slaTiempoMaxResolucionMin?: number;
  slaDescripcion?: string;
  slaNivelUrgencia?: Prioridad;
  etiquetas?: number[];
  especialidades?: number[];
}