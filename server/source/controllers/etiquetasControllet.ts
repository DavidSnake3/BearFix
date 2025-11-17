import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class EtiquetaController {
  prisma = new PrismaClient();

  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const etiquetas = await this.prisma.etiqueta.findMany({
        where: { activa: true },
        orderBy: { nombre: "asc" }
      });

      response.json(etiquetas);
    } catch (error) {
      next(error);
    }
  };

  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      let idEtiqueta = parseInt(request.params.id)
      if (isNaN(idEtiqueta)) {
        next(AppError.badRequest("El ID no es válido"))
        return;
      }

      const etiqueta = await this.prisma.etiqueta.findFirst({
        where: {
          id: idEtiqueta,
          activa: true
        }
      });

      if (etiqueta) {
        response.status(200).json(etiqueta)
      } else {
        next(AppError.notFound("No existe la etiqueta"))
      }

    } catch (error: any) {
      next(error)
    }
  };

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { nombre, descripcion } = request.body;

      if (!nombre) {
        next(AppError.badRequest("El nombre es requerido"));
        return;
      }

      const etiquetaExistente = await this.prisma.etiqueta.findFirst({
        where: { 
          nombre: nombre,
          activa: true 
        }
      });

      if (etiquetaExistente) {
        next(AppError.badRequest("Ya existe una etiqueta con este nombre"));
        return;
      }

      const nuevaEtiqueta = await this.prisma.etiqueta.create({
        data: {
          nombre,
          descripcion,
          activa: true
        }
      });

      response.status(201).json(nuevaEtiqueta);
    } catch (error) {
      console.error("Error creando etiqueta:", error);
      next(error);
    }
  };

  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idEtiqueta = parseInt(request.params.id);

      if (isNaN(idEtiqueta)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const etiquetaExistente = await this.prisma.etiqueta.findFirst({
        where: { 
          id: idEtiqueta,
          activa: true
        }
      });

      if (!etiquetaExistente) {
        next(AppError.notFound("No existe la etiqueta"));
        return;
      }

      if (body.nombre && body.nombre !== etiquetaExistente.nombre) {
        const nombreExistente = await this.prisma.etiqueta.findFirst({
          where: { 
            nombre: body.nombre,
            activa: true 
          }
        });

        if (nombreExistente) {
          next(AppError.badRequest("Ya existe una etiqueta con este nombre"));
          return;
        }
      }

      const etiquetaActualizada = await this.prisma.etiqueta.update({
        where: { id: idEtiqueta },
        data: {
          nombre: body.nombre,
          descripcion: body.descripcion
        }
      });

      response.json(etiquetaActualizada);
    } catch (error) {
      console.error("Error actualizando etiqueta:", error);
      next(error);
    }
  };

  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idEtiqueta = parseInt(request.params.id);

      if (isNaN(idEtiqueta)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const etiquetaExistente = await this.prisma.etiqueta.findFirst({
        where: { 
          id: idEtiqueta,
          activa: true
        }
      });

      if (!etiquetaExistente) {
        next(AppError.notFound("No existe la etiqueta"));
        return;
      }

      const etiquetaEnUso = await this.prisma.categoriaEtiqueta.findFirst({
        where: {
          etiquetaId: idEtiqueta
        }
      });

      if (etiquetaEnUso) {
        next(AppError.badRequest("No se puede eliminar la etiqueta porque está asociada a una categoría"));
        return;
      }

      const etiquetaEliminada = await this.prisma.etiqueta.update({
        where: { id: idEtiqueta },
        data: {
          activa: false
        }
      });

      response.json({
        message: "Etiqueta eliminada exitosamente",
        id: etiquetaEliminada.id
      });
    } catch (error) {
      console.error("Error eliminando etiqueta:", error);
      next(error);
    }
  };
}