import { CategoriaEtiqueta } from "./CategoriaEtiquetaModel";

export interface Etiqueta {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  categoriaEtiquetas?: CategoriaEtiqueta[];
}

export interface CreateEtiquetaDto {
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export interface UpdateEtiquetaDto {
  nombre?: string;
  descripcion?: string;
  activa?: boolean;
}