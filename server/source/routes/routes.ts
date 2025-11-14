import { Router } from 'express';

import { UserRoutes } from './userRoutes';
import { TecnicoRoutes } from './tecnico.routes';
import { CategoriaRoutes } from './categoria.routes';
import { TicketRoutes } from './ticket.routes';
import { EspecialidadRoutes } from './especialidad.routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use(UserRoutes.routes);
        router.use('/tecnicos', TecnicoRoutes.routes);
        router.use('/categorias', CategoriaRoutes.routes);
        router.use('/tickets', TicketRoutes.routes);
        router.use('/especialidades', EspecialidadRoutes.routes); 
        
    return router;
  }
}
