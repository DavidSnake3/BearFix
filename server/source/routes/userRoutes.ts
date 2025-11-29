import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

export class UserRoutes {
  static get routes() {
    const router = Router();
    const controller = new UserController();

        
    router.get('/api/user', authenticateToken, controller.getAllUsers);
    router.get('/api/user/perfil', authenticateToken, controller.obtenerPerfil);
    router.post('/api/user/actualizar', authenticateToken, controller.actualizarPerfil);
    router.get('/api/user/verificar-correo/:correo', authenticateToken, controller.verificarCorreoUnico);

    router.post('/api/user/authenticate', controller.authenticate);
    router.post('/api/user/register', controller.register);
    router.get('/api/user', controller.getAllUsers);
    router.post('/api/user/refresh', controller.refresh);
    router.post('/send-reset-email/:correo', controller.sendResetEmail);
    router.post('/reset-password', controller.resetPassword);
    router.post('/validate-reset-token', controller.validateResetToken);


    return router;
  }
}