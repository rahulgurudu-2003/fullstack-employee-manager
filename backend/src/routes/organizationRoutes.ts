import { Router } from 'express';
import { getOrgTree, getDashboardStats } from '../controllers/organizationController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/tree', getOrgTree);
router.get('/stats', getDashboardStats);

export default router;
