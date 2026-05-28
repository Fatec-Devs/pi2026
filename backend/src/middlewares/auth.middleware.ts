import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../config/AppError';
import { JwtPayload, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Token não informado', 'UNAUTHORIZED', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError('Token inválido ou expirado', 'UNAUTHORIZED', 401);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('Acesso não autorizado', 'FORBIDDEN', 403);
    }
    next();
  };
}
