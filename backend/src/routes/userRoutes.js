import express from 'express';
import {
    getStudentPicklist,
    getUsers,
    createUser,
    deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/students', authorize('Admin', 'Instructor'), getStudentPicklist);

router.route('/')
    .get(authorize('Admin'), getUsers)
    .post(authorize('Admin'), createUser);

router.route('/:id').delete(authorize('Admin'), deleteUser);

export default router;
