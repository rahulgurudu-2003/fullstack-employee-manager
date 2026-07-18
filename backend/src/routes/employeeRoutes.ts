import { Router } from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReportees,
  patchManager,
  importCSV,
} from '../controllers/employeeController';
import { protect, restrictTo } from '../middleware/auth';
import {
  employeeValidationRules,
  employeeUpdateValidationRules,
  validateRequest,
} from '../middleware/validate';

const router = Router();

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.get('/:id/reportees', getReportees);

router.post(
  '/',
  restrictTo('Super Admin', 'HR Manager'),
  employeeValidationRules,
  validateRequest,
  createEmployee
);

router.put(
  '/:id',
  employeeUpdateValidationRules,
  validateRequest,
  updateEmployee
);

router.delete(
  '/:id',
  restrictTo('Super Admin'),
  deleteEmployee
);

router.patch(
  '/:id/manager',
  restrictTo('Super Admin'),
  patchManager
);

router.post(
  '/import',
  restrictTo('Super Admin', 'HR Manager'),
  importCSV
);

export default router;
