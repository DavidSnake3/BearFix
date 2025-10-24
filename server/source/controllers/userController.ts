import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '../../generated/prisma';
import { createJwt, createRefreshToken, getPrincipleFromExpiredToken, getRefreshExpiry } from '../services/authService';
import { sendEmail } from '../services/emailService';
import { emailBody } from '../utils/emailBody';
import { hashPassword, verifyPassword } from '../utils/passwordHsher';

export class UserController {
  prisma = new PrismaClient();

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { correo, contrasena } = req.body;
      if (!correo || !contrasena) return res.status(400).json({ message: 'Faltan credenciales' });

      const usuario = await this.prisma.usuario.findUnique({ where: { correo } });
      if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

      if (!verifyPassword(contrasena, usuario.contrasenaHash)) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }

      const accessToken = createJwt({
        role: usuario.rol,
        name: usuario.nombre || usuario.correo,
        email: usuario.correo,
        userId: usuario.id,
        sub: usuario.correo
      });
      console.log('Token payload:', {
        role: usuario.rol,
        name: usuario.nombre || usuario.correo,
        email: usuario.correo,
        userId: usuario.id
      });
      const refreshToken = createRefreshToken();
      const refreshExpiry = getRefreshExpiry();

      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { refreshToken, refreshTokenExpiry: refreshExpiry, ultimoInicio: new Date() }
      });

      return res.json({ accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { correo, contrasena, nombre, telefono, rol } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({
          message: 'Correo y contraseña son requeridos'
        });
      }

      const exists = await this.prisma.usuario.findUnique({ where: { correo } });
      if (exists) return res.status(400).json({ message: 'Correo ya registrado' });

      if (contrasena.length < 8) return res.status(400).json({ message: 'Contraseña debe tener al menos 8 caracteres' });

      const rolesValidos: Role[] = [Role.ADM, Role.TEC, Role.USR];
      let rolFinal: Role = Role.USR;

      if (rol) {
        const rolUpperCase = rol.toUpperCase();
        if (rolesValidos.includes(rolUpperCase as Role)) {
          rolFinal = rolUpperCase as Role;
        } else {
          return res.status(400).json({
            message: 'Rol inválido. Los roles válidos son: ADM, TEC, USR'
          });
        }
      }

      const contrasenaHash = hashPassword(contrasena);
      const usuario = await this.prisma.usuario.create({
        data: {
          correo,
          contrasenaHash,
          nombre,
          telefono,
          rol: rolFinal
        }
      });

      return res.status(201).json({
        status: 200,
        message: 'Usuario creado',
        id: usuario.id,
        rol: usuario.rol
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.prisma.usuario.findMany();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = req.body;
      if (!accessToken || !refreshToken) return res.status(400).json({ message: 'Invalid Client Request' });

      const principal: any = getPrincipleFromExpiredToken(accessToken);
      const correo = principal.email || principal.sub;
      if (!correo) return res.status(400).json({ message: 'Invalid token payload' });

      const usuario = await this.prisma.usuario.findUnique({ where: { correo } });
      if (!usuario || usuario.refreshToken !== refreshToken || !usuario.refreshTokenExpiry || usuario.refreshTokenExpiry <= new Date()) {
        return res.status(400).json({ message: 'Invalid Request' });
      }

      const newAccessToken = createJwt({
        role: usuario.rol,
        name: usuario.nombre || usuario.correo,
        email: usuario.correo,
        userId: usuario.id,
        sub: usuario.correo
      });

      const newRefreshToken = createRefreshToken();
      const newExpiry = getRefreshExpiry();

      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { refreshToken: newRefreshToken, refreshTokenExpiry: newExpiry, ultimoInicio: new Date() }
      });

      return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
      next(error);
    }
  };

  sendResetEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const correo = req.params.correo;
      console.log('Solicitud de reset para:', correo);

      if (!correo) return res.status(400).json({ message: 'Correo requerido' });

      const usuario = await this.prisma.usuario.findUnique({ where: { correo } });
      if (!usuario) {
        console.log('Usuario no encontrado:', correo);
        return res.status(404).json({ message: "Correo no existe" });
      }

      const token = require('crypto').randomBytes(64).toString('base64');
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      console.log('Actualizando usuario con token de reset...');
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { resetPasswordToken: token, resetPasswordExpiry: expiry }
      });

      const body = emailBody(correo, token, process.env.FRONTEND_RESET_URL || 'http://localhost:4200/reset');
      console.log('Enviando email...');

      await sendEmail({
        to: correo,
        subject: 'Reset Password!!',
        content: body
      });

      console.log('Proceso de reset completado para:', correo);
      return res.json({ statusCode: 200, message: 'Email enviado' });
    } catch (error) {
      console.error('Error en sendResetEmail:', error);
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { correo, emailToken, newPassword } = req.body;
      if (!correo || !emailToken || !newPassword) return res.status(400).json({ message: 'Payload inválido' });

      const usuario = await this.prisma.usuario.findUnique({ where: { correo } });
      if (!usuario) return res.status(404).json({ message: "Usuario no existe" });

      if (usuario.resetPasswordToken !== emailToken || !usuario.resetPasswordExpiry || usuario.resetPasswordExpiry < new Date())
        return res.status(400).json({ message: 'Enlace de reseteo inválido' });

      const contrasenaHash = hashPassword(newPassword);
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { contrasenaHash, resetPasswordToken: null, resetPasswordExpiry: null }
      });

      return res.json({ statusCode: 200, message: 'Contraseña actualizada' });
    } catch (error) {
      next(error);
    }
  };
}