import express from 'express';
import { getStats, getDistribution, getRecentActivity } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication and Admin/Instructor roles
router.use(protect);
router.use(authorize('Admin', 'Instructor'));

router.get('/stats', getStats);
router.get('/distribution', getDistribution);
router.get('/activity', getRecentActivity);

export default router;
