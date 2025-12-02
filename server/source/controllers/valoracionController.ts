import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/custom.error";
import { PrismaClient, TicketEstado, Role } from "../../generated/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export class ValoracionController {
  prisma = new PrismaClient();

  create = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
      const user = request.user;
      const { ticketId, puntuacion, comentario } = request.body;

      if (!user) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      if (!ticketId || !puntuacion) {
        return next(AppError.badRequest("Ticket ID y puntuación son requeridos"));
      }

      if (puntuacion < 1 || puntuacion > 5) {
        return next(AppError.badRequest("La puntuación debe estar entre 1 y 5"));
      }

      const ticket = await this.prisma.ticket.findFirst({
        where: {
          id: ticketId,
          eliminadoLogico: false
        },
        include: {
          valoracion: true
        }
      });

      if (!ticket) {
        return next(AppError.notFound("Ticket no encontrado"));
      }

      if (ticket.estado !== TicketEstado.CERRADO) {
        return next(AppError.badRequest("Solo se puede valorar tickets cerrados"));
      }

      if (ticket.valoracion) {
        return next(AppError.badRequest("El ticket ya tiene una valoración"));
      }

      const nuevaValoracion = await this.prisma.valoracion.create({
        data: {
          ticketId: ticketId,
          usuarioId: user.userId, 
          puntuacion: puntuacion,
          comentario: comentario
        },
        include: {
          usuario: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });

      response.status(201).json({
        success: true,
        message: "Valoración registrada exitosamente",
        valoracion: nuevaValoracion
      });
    } catch (error) {
      next(error);
    }
  };

  getByTicketId = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const ticketId = parseInt(request.params.ticketId);
      if (isNaN(ticketId)) {
        return next(AppError.badRequest("Ticket ID no válido"));
      }

      const valoracion = await this.prisma.valoracion.findFirst({
        where: {
          ticketId: ticketId
        },
        include: {
          usuario: {
            select: {
              nombre: true,
              correo: true
            }
          }
        }
      });

      if (!valoracion) {
        return next(AppError.notFound("No se encontró valoración para este ticket"));
      }

      response.json(valoracion);
    } catch (error) {
      next(error);
    }
  };

  getByTecnico = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
      const user = request.user;
      const tecnicoId = parseInt(request.params.tecnicoId);

      if (!user) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      if (user.role !== Role.ADM && user.role !== Role.TEC) {
        return next(AppError.forbidden("No tienes permisos para ver valoraciones"));
      }

      if (isNaN(tecnicoId)) {
        return next(AppError.badRequest("Técnico ID no válido"));
      }

      const valoraciones = await this.prisma.valoracion.findMany({
        where: {
          ticket: {
            asignaciones: {
              some: {
                tecnicoId: tecnicoId,
                activo: true
              }
            }
          }
        },
        include: {
          ticket: {
            select: {
              consecutivo: true,
              titulo: true
            }
          },
          usuario: {
            select: {
              nombre: true,
              correo: true
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      });

      response.json(valoraciones);
    } catch (error) {
      next(error);
    }
  };

  getPromedioByTecnico = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
      const user = request.user;
      const tecnicoId = parseInt(request.params.tecnicoId);

      if (!user) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      if (user.role !== Role.ADM && user.role !== Role.TEC) {
        return next(AppError.forbidden("No tienes permisos para ver promedios de valoraciones"));
      }

      if (isNaN(tecnicoId)) {
        return next(AppError.badRequest("Técnico ID no válido"));
      }

      const agregaciones = await this.prisma.valoracion.aggregate({
        where: {
          ticket: {
            asignaciones: {
              some: {
                tecnicoId: tecnicoId,
                activo: true
              }
            }
          }
        },
        _avg: {
          puntuacion: true
        },
        _count: {
          puntuacion: true
        }
      });

      response.json({
        tecnicoId,
        promedio: agregaciones._avg.puntuacion,
        totalValoraciones: agregaciones._count.puntuacion
      });
    } catch (error) {
      next(error);
    }
  };

  getAllValoraciones = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
      const user = request.user;

      if (!user) {
        return next(AppError.unauthorized("Usuario no autenticado"));
      }

      if (user.role !== Role.ADM) {
        return next(AppError.forbidden("Solo los administradores pueden ver todas las valoraciones"));
      }

      const valoraciones = await this.prisma.valoracion.findMany({
        include: {
          ticket: {
            select: {
              consecutivo: true,
              titulo: true,
              estado: true
            }
          },
          usuario: {
            select: {
              nombre: true,
              correo: true
            }
          }
        },
        orderBy: {
          creadoEn: 'desc'
        }
      });

      response.json(valoraciones);
    } catch (error) {
      next(error);
    }
  };
}