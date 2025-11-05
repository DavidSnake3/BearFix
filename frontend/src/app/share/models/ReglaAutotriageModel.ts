import { Asignacion } from "./AsignacionModel";
import { Categoria } from "./CategoriaModel";
import { Especialidad } from "./EspecialidadModel";


export interface ReglaAutotriage {
  id: number;
  nombre: string;
  descripcion?: string;
  criterios: any; // JSON
  formulaPrioridad?: string;
  limiteCargaTecnico?: number;
  ordenPrioridad: number;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;

  categoriaId: number;
  especialidadId?: number;
  
  categoria?: Categoria;
  especialidad?: Especialidad;
  asignaciones?: Asignacion[];
}

export interface CreateReglaAutotriageDto {
  nombre: string;
  descripcion?: string;
  criterios: any;
  formulaPrioridad?: string;
  limiteCargaTecnico?: number;
  ordenPrioridad: number;
  activo?: boolean;
  categoriaId: number;
  especialidadId?: number;
}