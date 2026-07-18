import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { mapEmployee } from '../models/Employee';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'supersecretemskeyjwt123!',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any }
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const employee = await prisma.employee.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive',
        },
        isDeleted: false,
      },
      include: {
        reportingManager: true,
      },
    });

    if (!employee) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (employee.status === 'Inactive') {
      res.status(403).json({ message: 'Account is inactive. Contact admin.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = signToken(employee.id, employee.role);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        employee: mapEmployee(employee),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: 'No user found' });
      return;
    }
    
    const employee = await prisma.employee.findUnique({
      where: { id: req.user.id },
      include: {
        reportingManager: true,
      },
    });

    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        employee: mapEmployee(employee),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
