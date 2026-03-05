import express from 'express';
import { getMyAttempts, getQuizAttempts } from '../controllers/attemptController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyAttempts);
router.get('/quiz/:quizId', authorize('Admin', 'Instructor'), getQuizAttempts);

export default router;
