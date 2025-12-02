import { Router } from 'express';
import { ValoracionController } from '../controllers/valoracionController';
import { authenticateToken } from '../middleware/authMiddleware';

export class ValoracionRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new ValoracionController();

    router.use(authenticateToken);

    router.post('/', controller.create);
    router.get('/ticket/:ticketId', controller.getByTicketId);
    router.get('/tecnico/:tecnicoId', controller.getByTecnico);
    router.get('/tecnico/:tecnicoId/promedio', controller.getPromedioByTecnico);
    router.get('/todas', controller.getAllValoraciones);

    return router;
  }
}