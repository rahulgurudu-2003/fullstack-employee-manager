import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const employeeValidationRules = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .trim(),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$|^[0-9]{10}$/)
    .withMessage('Please provide a valid phone number'),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .trim(),
  body('designation')
    .notEmpty()
    .withMessage('Designation is required')
    .trim(),
  body('salary')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  body('joiningDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('role')
    .optional()
    .isIn(['Super Admin', 'HR Manager', 'Employee'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Invalid status'),
];

export const employeeUpdateValidationRules = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$|^[0-9]{10}$/)
    .withMessage('Please provide a valid phone number'),
  body('department').optional().notEmpty().withMessage('Department cannot be empty').trim(),
  body('designation').optional().notEmpty().withMessage('Designation cannot be empty').trim(),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('joiningDate').optional().isISO8601().withMessage('Please provide a valid date'),
  body('role').optional().isIn(['Super Admin', 'HR Manager', 'Employee']).withMessage('Invalid role'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Invalid status'),
];
