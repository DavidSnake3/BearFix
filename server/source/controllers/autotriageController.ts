import { Request, Response, NextFunction } from 'express';
import { AutotriageService } from '../services/autotriageService';
import { AppError } from '../errors/custom.error';
import { PrismaClient } from '../../generated/prisma';

export class AutotriageController {
  private autotriageService: AutotriageService;
  private prisma: PrismaClient;

  constructor() {
    this.autotriageService = new AutotriageService();
    this.prisma = new PrismaClient();
  }

  ejecutarAutotriage = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = (request as any).user;

      if (user.role !== 'ADM') {
        return next(AppError.forbidden('Solo los administradores pueden ejecutar autotriage'));
      }

      const resultados = await this.autotriageService.asignarAutomaticamente();
      
      response.json({ 
        success: true,
        message: 'Autotriage ejecutado correctamente',
        data: {
          resultados,
          totalProcesados: resultados.length,
          exitosos: resultados.filter(r => r.exito).length,
          fallidos: resultados.filter(r => !r.exito).length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  obtenerEstadisticas = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = (request as any).user;

    if (user.role !== 'ADM' && user.role !== 'TEC') {
      return next(AppError.forbidden('Solo administradores y técnicos pueden ver estadísticas'));
    }

        const estadisticas = {
        totalTickets: await this.prisma.ticket.count(),
        ticketsPendientes: await this.prisma.ticket.count({ where: { estado: 'PENDIENTE' } }),
      };

      const ticketsPendientes = await this.prisma.ticket.count({
        where: {
          estado: 'PENDIENTE',
          eliminadoLogico: false
        }
      });

      const tecnicosDisponibles = await this.prisma.usuario.count({
        where: {
          rol: 'TEC',
          activo: true,
          disponible: true
        }
      });

      response.json({
        success: true,
        data: {
          ticketsPendientes,
          tecnicosDisponibles,
          estadisticas,
          fechaConsulta: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };
}