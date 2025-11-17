import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, Prioridad } from "../../generated/prisma";

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
            descripcion: true,
            activa: true,
            slaNombre: true,
            slaTiempoMaxRespuestaMin: true,
            slaTiempoMaxResolucionMin: true,
            slaNivelUrgencia: true
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
        return;
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
            nombre: objCategoria.slaNombre,
            tiempoMaximoRespuesta: objCategoria.slaTiempoMaxRespuestaMin,
            tiempoMaximoResolucion: objCategoria.slaTiempoMaxResolucionMin,
            nivelUrgencia: objCategoria.slaNivelUrgencia,
            descripcion: objCategoria.slaDescripcion
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

  getEtiquetasByCategoriaId = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const categoriaId = parseInt(request.params.id);
      
      if (isNaN(categoriaId)) {
        return next(AppError.badRequest("El ID de categoría no es válido"));
      }

      const categoria = await this.prisma.categoria.findFirst({
        where: {
          id: categoriaId,
          activa: true
        },
        include: {
          categoriaEtiquetas: {
            include: {
              etiqueta: true
            },
            where: {
              etiqueta: {
                activa: true
              }
            }
          }
        }
      });

      if (!categoria) {
        return next(AppError.notFound("No existe la categoría o no está activa"));
      }

      const etiquetas = categoria.categoriaEtiquetas.map((ce: any) => ce.etiqueta);

      response.json({
        success: true,
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre
        },
        etiquetas: etiquetas
      });
    } catch (error) {
      console.error("Error obteniendo etiquetas por categoría:", error);
      next(error);
    }
  };

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;

      if (!body.nombre) {
        next(AppError.badRequest("El nombre es requerido"));
        return;
      }

      if (!body.codigo) {
        next(AppError.badRequest("El código es requerido"));
        return;
      }

      const codigoExistente = await this.prisma.categoria.findUnique({
        where: { codigo: body.codigo }
      });

      if (codigoExistente) {
        next(AppError.badRequest("Ya existe una categoría con este código"));
        return;
      }

      if (body.slaTiempoMaxRespuestaMin && body.slaTiempoMaxRespuestaMin <= 0) {
        next(AppError.badRequest("El tiempo máximo de respuesta debe ser mayor a cero"));
        return;
      }

      if (body.slaTiempoMaxResolucionMin && body.slaTiempoMaxRespuestaMin) {
        if (body.slaTiempoMaxResolucionMin <= body.slaTiempoMaxRespuestaMin) {
          next(AppError.badRequest("El tiempo máximo de resolución debe ser mayor al tiempo de respuesta"));
          return;
        }
      }

      const newCategoria = await this.prisma.categoria.create({
        data: {
          codigo: body.codigo,
          nombre: body.nombre,
          descripcion: body.descripcion,
          slaNombre: body.slaNombre,
          slaTiempoMaxRespuestaMin: body.slaTiempoMaxRespuestaMin,
          slaTiempoMaxResolucionMin: body.slaTiempoMaxResolucionMin,
          slaDescripcion: body.slaDescripcion,
          slaNivelUrgencia: body.slaNivelUrgencia,
          categoriaEtiquetas: body.etiquetas && body.etiquetas.length > 0 ? {
            create: body.etiquetas.map((etiquetaId: number) => ({
              etiquetaId: etiquetaId
            }))
          } : undefined,
          categoriaEspecialidades: body.especialidades && body.especialidades.length > 0 ? {
            create: body.especialidades.map((especialidadId: number) => ({
              especialidadId: especialidadId
            }))
          } : undefined
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
      });

      const categoriaResponse = {
        ...newCategoria,
        etiquetas: newCategoria.categoriaEtiquetas.map(ce => ce.etiqueta),
        especialidades: newCategoria.categoriaEspecialidades.map(ce => ce.especialidad)
      };

      response.status(201).json(categoriaResponse);
    } catch (error) {
      console.error("Error creando categoría:", error);
      next(error);
    }
  };

  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idCategoria = parseInt(request.params.id);

      if (isNaN(idCategoria)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const categoriaExistente = await this.prisma.categoria.findFirst({
        where: { 
          id: idCategoria,
          activa: true
        },
        include: {
          categoriaEtiquetas: {
            select: {
              etiquetaId: true
            }
          },
          categoriaEspecialidades: {
            select: {
              especialidadId: true
            }
          }
        }
      });

      if (!categoriaExistente) {
        next(AppError.notFound("No existe la categoría"));
        return;
      }

      if (body.codigo && body.codigo !== categoriaExistente.codigo) {
        const codigoExistente = await this.prisma.categoria.findUnique({
          where: { codigo: body.codigo }
        });

        if (codigoExistente) {
          next(AppError.badRequest("Ya existe una categoría con este código"));
          return;
        }
      }

      if (body.slaTiempoMaxRespuestaMin && body.slaTiempoMaxRespuestaMin <= 0) {
        next(AppError.badRequest("El tiempo máximo de respuesta debe ser mayor a cero"));
        return;
      }

      if (body.slaTiempoMaxResolucionMin && body.slaTiempoMaxRespuestaMin) {
        if (body.slaTiempoMaxResolucionMin <= body.slaTiempoMaxRespuestaMin) {
          next(AppError.badRequest("El tiempo máximo de resolución debe ser mayor al tiempo de respuesta"));
          return;
        }
      }

      const updateData: any = {
        nombre: body.nombre,
        descripcion: body.descripcion,
        slaNombre: body.slaNombre,
        slaTiempoMaxRespuestaMin: body.slaTiempoMaxRespuestaMin,
        slaTiempoMaxResolucionMin: body.slaTiempoMaxResolucionMin,
        slaDescripcion: body.slaDescripcion,
        slaNivelUrgencia: body.slaNivelUrgencia
      };

      if (body.codigo) {
        updateData.codigo = body.codigo;
      }

      const updatedCategoria = await this.prisma.categoria.update({
        where: { id: idCategoria },
        data: {
          ...updateData,
          categoriaEtiquetas: {
            deleteMany: {},
            create: body.etiquetas ? body.etiquetas.map((etiquetaId: number) => ({
              etiquetaId: etiquetaId
            })) : []
          },
          categoriaEspecialidades: {
            deleteMany: {},
            create: body.especialidades ? body.especialidades.map((especialidadId: number) => ({
              especialidadId: especialidadId
            })) : []
          }
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
      });

      const categoriaResponse = {
        ...updatedCategoria,
        etiquetas: updatedCategoria.categoriaEtiquetas.map(ce => ce.etiqueta),
        especialidades: updatedCategoria.categoriaEspecialidades.map(ce => ce.especialidad)
      };

      response.json(categoriaResponse);
    } catch (error) {
      console.error("Error actualizando categoría:", error);
      next(error);
    }
  };

  delete = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const idCategoria = parseInt(request.params.id);

      if (isNaN(idCategoria)) {
        next(AppError.badRequest("El ID no es válido"));
        return;
      }

      const categoriaExistente = await this.prisma.categoria.findFirst({
        where: { 
          id: idCategoria,
          activa: true
        }
      });

      if (!categoriaExistente) {
        next(AppError.notFound("No existe la categoría"));
        return;
      }

      const ticketsAsociados = await this.prisma.ticket.count({
        where: {
          categoriaId: idCategoria,
          eliminadoLogico: false,
          estado: {
            in: ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO', 'ESPERA_CLIENTE']
          }
        }
      });

      if (ticketsAsociados > 0) {
        next(AppError.badRequest("No se puede eliminar la categoría porque tiene tickets activos asociados"));
        return;
      }

      const categoriaEliminada = await this.prisma.categoria.update({
        where: { id: idCategoria },
        data: {
          activa: false
        }
      });

      response.json({
        message: "Categoría eliminada exitosamente",
        id: categoriaEliminada.id
      });
    } catch (error) {
      console.error("Error eliminando categoría:", error);
      next(error);
    }
  };
}