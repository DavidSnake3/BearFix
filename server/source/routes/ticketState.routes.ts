import { Router } from 'express';
import { TicketStateController } from '../controllers/ticketStateController';
import { authenticateToken } from '../middleware/authMiddleware';

export class TicketStateRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new TicketStateController();
    router.use(authenticateToken);
    router.put('/:ticketId/estado', controller.cambiarEstado);
    router.get('/:ticketId/historial', controller.obtenerHistorial);

    return router;
  }
}