import express from 'express';
import {
    createSubject,
    getSubjects,
    updateSubject,
    deleteSubject,
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getSubjects)
    .post(authorize('Admin', 'Instructor'), createSubject);

router
    .route('/:id')
    .put(authorize('Admin', 'Instructor'), updateSubject)
    .delete(authorize('Admin', 'Instructor'), deleteSubject);

export default router;
