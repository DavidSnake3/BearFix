import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { AppError } from '../errors/custom.error';
import { AuthRequest } from '../middleware/authMiddleware';

export class NotificationController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  obtenerNotificaciones = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = (request as any).user;
      const { leidas, page = '1', limit = '10' } = request.query;

      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      const where: any = { destinatarioId: user.userId };
      if (leidas !== undefined) {
        where.leida = leidas === 'true';
      }

      const [notificaciones, total] = await Promise.all([
        this.prisma.notificacion.findMany({
          where,
          include: {
            remitente: {
              select: { nombre: true, correo: true }
            }
          },
          orderBy: { creadoEn: 'desc' },
          skip,
          take: limitNum
        }),
        this.prisma.notificacion.count({ where })
      ]);

      response.json({
        notificaciones,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      });
    } catch (error) {
      next(error);
    }
  };

  marcarComoLeida = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { notificacionId } = request.params;
      const user = (request as any).user;

      const notificacion = await this.prisma.notificacion.findFirst({
        where: { 
          id: parseInt(notificacionId),
          destinatarioId: user.userId 
        }
      });

      if (!notificacion) {
        return next(AppError.notFound('Notificación no encontrada'));
      }

      const actualizada = await this.prisma.notificacion.update({
        where: { id: parseInt(notificacionId) },
        data: { leida: true }
      });

      response.json(actualizada);
    } catch (error) {
      next(error);
    }
  };

  contarNoLeidas = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
      const user = request.user;

      if (!user) {
        return next(AppError.unauthorized('Usuario no autenticado'));
      }

      const count = await this.prisma.notificacion.count({
        where: {
          destinatarioId: user.userId,
          leida: false
        }
      });

      response.json({ count });
    } catch (error) {
      next(error);
    }
  };

  marcarTodasComoLeidas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = (request as any).user;

      await this.prisma.notificacion.updateMany({
        where: {
          destinatarioId: user.userId,
          leida: false
        },
        data: { leida: true }
      });

      response.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      next(error);
    }
  };
}