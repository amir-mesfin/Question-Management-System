import express from 'express';
import {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
} from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All quiz routes require authentication
router.use(protect);

router
    .route('/')
    .get(getQuizzes)
    .post(authorize('Admin', 'Instructor'), createQuiz);

router
    .route('/:id')
    .get(getQuizById)
    .put(authorize('Admin', 'Instructor'), updateQuiz)
    .delete(authorize('Admin', 'Instructor'), deleteQuiz);

router.post('/:id/submit', submitQuiz);

export default router;
