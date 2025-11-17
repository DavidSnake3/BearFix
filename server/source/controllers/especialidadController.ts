import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class EspecialidadController {
  prisma = new PrismaClient();

  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const listado = await this.prisma.especialidad.findMany({
        where: {
          activa: true
        },
        orderBy: {
          nombre: "asc"
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          descripcion: true
        }
      });
      
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      let idEspecialidad = parseInt(request.params.id);
      if (isNaN(idEspecialidad)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const especialidad = await this.prisma.especialidad.findFirst({
        where: { 
          id: idEspecialidad,
          activa: true
        }
      });

      if (especialidad) {
        response.status(200).json(especialidad);
      } else {
        next(AppError.notFound("No existe la especialidad"));
      }
    } catch (error: any) {
      next(error);
    }
  };

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { codigo, nombre, descripcion } = request.body;

      if (!codigo || !nombre) {
        next(AppError.badRequest("El código y nombre son requeridos"));
        return;
      }

      const codigoExistente = await this.prisma.especialidad.findUnique({
        where: { codigo: codigo }
      });

      if (codigoExistente) {
        next(AppError.badRequest("Ya existe una especialidad con este código"));
        return;
      }

      const nuevaEspecialidad = await this.prisma.especialidad.create({
        data: {
          codigo: codigo,
          nombre: nombre,
          descripcion: descripcion,
          activa: true
        }
      });

      response.status(201).json(nuevaEspecialidad);
    } catch (error) {
      console.error("Error creando especialidad:", error);
      next(error);
    }
  };

  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idEspecialidad = parseInt(request.params.id);

      if (isNaN(idEspecialidad)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const especialidadExistente = await this.prisma.especialidad.findFirst({
        where: { 
          id: idEspecialidad,
          activa: true
        }
      });

      if (!especialidadExistente) {
        next(AppError.notFound("No existe la especialidad"));
        return;
      }

      if (body.codigo && body.codigo !== especialidadExistente.codigo) {
        const codigoExistente = await this.prisma.especialidad.findUnique({
          where: { codigo: body.codigo }
        });

        if (codigoExistente) {
          next(AppError.badRequest("Ya existe una especialidad con este código"));
          return;
        }
      }

      const especialidadActualizada = await this.prisma.especialidad.update({
        where: { id: idEspecialidad },
        data: {
          codigo: body.codigo,
          nombre: body.nombre,
          descripcion: body.descripcion
        }
      });

      response.json(especialidadActualizada);
    } catch (error) {
      console.error("Error actualizando especialidad:", error);
      next(error);
    }
  };

  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idEspecialidad = parseInt(request.params.id);

      if (isNaN(idEspecialidad)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const especialidadExistente = await this.prisma.especialidad.findFirst({
        where: { 
          id: idEspecialidad,
          activa: true
        }
      });

      if (!especialidadExistente) {
        next(AppError.notFound("No existe la especialidad"));
        return;
      }

      const especialidadEnUsuarios = await this.prisma.usuarioEspecialidad.findFirst({
        where: {
          especialidadId: idEspecialidad
        }
      });

      const especialidadEnCategorias = await this.prisma.categoriaEspecialidad.findFirst({
        where: {
          especialidadId: idEspecialidad
        }
      });

      if (especialidadEnUsuarios || especialidadEnCategorias) {
        next(AppError.badRequest("No se puede eliminar la especialidad porque está asociada a usuarios o categorías"));
        return;
      }

      const especialidadEliminada = await this.prisma.especialidad.update({
        where: { id: idEspecialidad },
        data: {
          activa: false
        }
      });

      response.json({
        message: "Especialidad eliminada exitosamente",
        id: especialidadEliminada.id
      });
    } catch (error) {
      console.error("Error eliminando especialidad:", error);
      next(error);
    }
  };
}