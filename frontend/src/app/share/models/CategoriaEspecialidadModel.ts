import { Categoria } from "./CategoriaModel";
import { Especialidad } from "./EspecialidadModel";


export interface CategoriaEspecialidad {
  categoriaId: number;
  especialidadId: number;
  categoria?: Categoria;
  especialidad?: Especialidad;
}

export interface CreateCategoriaEspecialidadDto {
  categoriaId: number;
  especialidadId: number;
}