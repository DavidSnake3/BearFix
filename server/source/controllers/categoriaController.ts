import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient } from "../../generated/prisma";

export class CategoriaController {
  prisma = new PrismaClient();

  get = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const {
        search = '',
        page = '1',
        limit = '5'
      } = request.query;

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
      const skip = (pageNum - 1) * limitNum;

      let whereCondition: any = { activa: true };

      if (search && search !== '') {
        whereCondition.OR = [
          { codigo: { contains: search as string } },
          { nombre: { contains: search as string } }
        ];
      }

      const [listado, totalCount] = await Promise.all([
        this.prisma.categoria.findMany({
          where: whereCondition,
          orderBy: {
            nombre: "asc"
          },
          skip: skip,
          take: limitNum,
          select: {
            id: true,
            codigo: true,
            nombre: true,
            descripcion: true
          }
        }),
        this.prisma.categoria.count({
          where: whereCondition
        })
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      const resultado = {
        categorias: listado,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };

      response.json(resultado);
    } catch (error) {
      next(error);
    }
  };

  getById = async (request: Request, response: Response, next: NextFunction) => {
    try {
      let idCategoria = parseInt(request.params.id)
      if (isNaN(idCategoria)) {
        next(AppError.badRequest("El ID no es válido"))
      }

      const objCategoria = await this.prisma.categoria.findFirst({
        where: {
          id: idCategoria,
          activa: true
        },
        include: {
          categoriaEtiquetas: {
            include: {
              etiqueta: true
            }
          },
          categoriaEspecialidades: {
            include: {
              especialidad: true
            }
          }
        }
      })

      if (objCategoria) {
        const categoriaDetallada = {
          ...objCategoria,
          etiquetas: objCategoria.categoriaEtiquetas.map(ce => ce.etiqueta),
          especialidades: objCategoria.categoriaEspecialidades.map(ce => ce.especialidad),
          sla: {
            tiempoMaximoRespuesta: objCategoria.slaTiempoMaxRespuestaMin,
            tiempoMaximoResolucion: objCategoria.slaTiempoMaxResolucionMin,
            nivelUrgencia: objCategoria.slaNivelUrgencia
          }
        }

        response.status(200).json(categoriaDetallada)
      } else {
        next(AppError.notFound("No existe la categoría"))
      }

    } catch (error: any) {
      next(error)
    }
  };

}