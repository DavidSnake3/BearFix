import { Router } from 'express'
import { TecnicoController } from '../controllers/tecnicoController'

export class TecnicoRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new TecnicoController()

        router.get('/', controller.get)
        router.get('/:id', controller.getById)
        router.post('/', controller.create)
        router.put('/:id', controller.update)
        router.delete('/:id', controller.delete)

        return router
    }
}