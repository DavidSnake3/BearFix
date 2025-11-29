import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/custom.error';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(AppError.unauthorized('Token de acceso requerido'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    

    
    const userId = parseInt(decoded.userId || decoded.id || decoded.nameid);
    
    
    if (isNaN(userId)) {
      return next(AppError.unauthorized('Token inválido: ID de usuario no válido'));
    }

    req.user = {
      userId: userId,
      role: decoded.role || 'USR',
      email: decoded.email || ''
    };

    
    next();
  } catch (error) {
    return next(AppError.unauthorized('Token inválido o expirado'));
  }
};