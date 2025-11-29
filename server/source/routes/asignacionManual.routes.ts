import { Router } from 'express';
import { AsignacionManualController } from '../controllers/asignacionManualController';
import { authenticateToken } from '../middleware/authMiddleware';

export class AsignacionManualRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new AsignacionManualController();
    router.use(authenticateToken);
    router.get('/tickets-pendientes', controller.obtenerTicketsPendientes);
    router.get('/tecnicos-disponibles', controller.obtenerTecnicosDisponibles);
    router.post('/asignar', controller.asignarManual);

    return router;
  }
}