import { Router } from 'express'
import { CategoriaController } from '../controllers/categoriaController'

export class CategoriaRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new CategoriaController()

        router.get('/', controller.get)
        router.get('/:id', controller.getById)

        return router
    }
}