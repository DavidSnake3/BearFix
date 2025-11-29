import { Router } from 'express'
import { EtiquetaController } from '../controllers/etiquetasControllet'
import { authenticateToken } from '../middleware/authMiddleware';

export class EtiquetaRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new EtiquetaController()
        router.use(authenticateToken);
        router.get('/', controller.get)
        router.get('/:id', controller.getById)
        router.post('/', controller.create)
        router.put('/:id', controller.update)
        router.delete('/:id', controller.delete)
        router.get('/con-categoria/lista', controller.getEtiquetasConCategoria)
        router.get('/:etiquetaId/categoria', controller.getCategoriaByEtiquetaId)

        return router
    }
}