import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

export class NotificationRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new NotificationController();
    router.use(authenticateToken);
    router.get('/', controller.obtenerNotificaciones);
    router.put('/:notificacionId/leida', controller.marcarComoLeida);
    router.put('/marcar-todas-leidas', controller.marcarTodasComoLeidas);
    router.get('/contar-no-leidas', controller.contarNoLeidas);

    return router;
  }
}