import { Categoria } from "./CategoriaModel";
import { Etiqueta } from "./EtiquetaModel";

export interface CategoriaEtiqueta {
  categoriaId: number;
  etiquetaId: number;
  categoria?: Categoria;
  etiqueta?: Etiqueta;
}

export interface CreateCategoriaEtiquetaDto {
  categoriaId: number;
  etiquetaId: number;
}