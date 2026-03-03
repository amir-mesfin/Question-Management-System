import express from 'express';
import {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    exportQuestions,
    importQuestions,
} from '../controllers/questionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All question routes require authentication
router.use(protect);

router
    .route('/')
    .get(getQuestions)
    .post(authorize('Admin', 'Instructor'), createQuestion);

router
    .route('/export')
    .get(authorize('Admin', 'Instructor'), exportQuestions);

router
    .route('/import')
    .post(authorize('Admin', 'Instructor'), importQuestions);

router
    .route('/:id')
    .get(getQuestionById)
    .put(authorize('Admin', 'Instructor'), updateQuestion)
    .delete(authorize('Admin', 'Instructor'), deleteQuestion);

export default router;
