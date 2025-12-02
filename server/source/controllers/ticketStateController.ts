import { Request, Response, NextFunction } from 'express';
import { TicketStateService } from '../services/ticketStateService';
import { AppError } from '../errors/custom.error';

export class TicketStateController {
  private ticketStateService: TicketStateService;

  constructor() {
    this.ticketStateService = new TicketStateService();
  }

  cambiarEstado = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { ticketId } = request.params;
      const { nuevoEstado, observaciones, imagenes } = request.body;
      const usuarioId = parseInt(request.headers['user-id'] as string);

      if (isNaN(usuarioId)) {
        return next(AppError.badRequest('User ID no válido'));
      }

      if (!nuevoEstado || !observaciones) {
        return next(AppError.badRequest('Estado y observaciones son requeridos'));
      }

      const resultado = await this.ticketStateService.cambiarEstado(
        parseInt(ticketId),
        nuevoEstado,
        usuarioId,
        observaciones,
        imagenes || []
      );

      response.json({
        success: true,
        message: 'Estado del ticket actualizado correctamente',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  };

  obtenerHistorial = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { ticketId } = request.params;
      const historial = await this.ticketStateService.obtenerHistorialTicket(parseInt(ticketId));

      response.json({
        success: true,
        data: historial
      });
    } catch (error) {
      next(error);
    }
  };

}