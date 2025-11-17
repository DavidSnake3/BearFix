import { Router } from 'express'
import { TicketController } from '../controllers/ticketController'

export class TicketRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new TicketController()

        router.get('/dashboard', controller.getTicketsDashboard);
        router.get('/mis-tickets', controller.getMisTicketsCreados)  
        router.get('/asignaciones/todas', controller.getTodasAsignaciones)  
        router.get('/asignaciones/todas-con-filtros', controller.getTodasAsignacionesConFiltros);
        router.get('/asignaciones/mis-asignaciones', controller.getMisAsignaciones)  
        router.get('/asignaciones/:id', controller.getAsignacionesByID);
        router.get("/asignaciones/admin/:id", controller.getAsignacionByTicketIdForAdmin);
        
        router.get('/prioridades', controller.getPrioridades);
        router.get('/usuarios', controller.getUsuarios);
        router.get('/categorias-con-etiquetas', controller.getCategoriasConEtiquetas);
        router.post('/', controller.create);
        router.put('/:id', controller.update);
        router.delete('/:id', controller.delete);
        
        router.get('/', controller.get)  
        router.get('/:id', controller.getById) 
        router.delete('/:id/imagenes/:imagenId', controller.eliminarImagen);

        return router
    }
}