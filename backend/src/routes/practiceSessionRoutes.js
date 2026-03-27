import express from 'express';
import { createPracticeSession, getMyPracticeSessions } from '../controllers/practiceSessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createPracticeSession);
router.get('/my', getMyPracticeSessions);

export default router;
