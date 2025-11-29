import { Router } from 'express';
import { AutotriageController } from '../controllers/autotriageController';
import { authenticateToken } from '../middleware/authMiddleware';

export class AutotriageRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new AutotriageController();
    router.use(authenticateToken);
    router.post('/ejecutar', controller.ejecutarAutotriage);
    router.get('/estadisticas', controller.obtenerEstadisticas); // Nueva ruta

    return router;
  }
}