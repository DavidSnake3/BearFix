import { Router } from 'express'
import { CategoriaController } from '../controllers/categoriaController'
import { authenticateToken } from '../middleware/authMiddleware';

export class CategoriaRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new CategoriaController()
        router.use(authenticateToken);
        router.get('/', controller.get)
        router.get('/:id', controller.getById)
        router.get('/:id/etiquetas', controller.getEtiquetasByCategoriaId)
        router.post('/', controller.create)
        router.put('/:id', controller.update)
        router.delete('/:id', controller.delete)

        return router
    }
}