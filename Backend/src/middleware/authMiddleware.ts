import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
    req.user = user as AuthenticatedUser;
    next();
  });
};

const authorizeRoles = (...allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    res.status(403).json({ message: 'Access denied' });
    return;
  }
  next();
};

export { authenticateToken, authorizeRoles };
export default { authenticateToken, authorizeRoles };
