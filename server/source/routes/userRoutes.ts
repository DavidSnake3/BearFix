import { Router } from 'express';
import { UserController } from '../controllers/userController';

export class UserRoutes {
  static get routes() {
    const router = Router();
    const controller = new UserController();

    router.post('/api/user/authenticate', controller.authenticate);
    router.post('/api/user/register', controller.register);
    router.get('/api/user', controller.getAllUsers);
    router.post('/api/user/refresh', controller.refresh);
    router.post('/api/user/send-reset-email/:correo', controller.sendResetEmail);
    router.post('/api/user/reset-password', controller.resetPassword);

    return router;
  }
}