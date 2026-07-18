import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IEmployee } from '../models/Employee';
import { prisma } from '../config/db';

export interface AuthRequest extends Request {
  user?: IEmployee;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretemskeyjwt123!') as { id: string };
    
    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },
    });
    if (!user) {
      res.status(401).json({ message: 'User belonging to this token no longer exists' });
      return;
    }

    if (user.isDeleted) {
      res.status(401).json({ message: 'User account has been deleted' });
      return;
    }

    if (user.status === 'Inactive') {
      res.status(401).json({ message: 'User account is inactive' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'You do not have permission to perform this action' });
      return;
    }

    next();
  };
};
