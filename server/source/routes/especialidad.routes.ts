import { Router } from 'express'
import { EspecialidadController } from '../controllers/especialidadController'

export class EspecialidadRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new EspecialidadController()

        router.get('/', controller.get)
        router.get('/:id', controller.getById)

        return router
    }
}