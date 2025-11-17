import { Router } from 'express'
import { EspecialidadController } from '../controllers/especialidadController'

export class EspecialidadRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new EspecialidadController()

        router.get('/', controller.get)
        router.get('/:id', controller.getById)
        router.post('/', controller.create)
        router.put('/:id', controller.update)
        router.delete('/:id', controller.delete)

        return router
    }
}