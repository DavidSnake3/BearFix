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
}