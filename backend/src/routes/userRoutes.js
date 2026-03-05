import express from 'express';
import {
    getUsers,
    createUser,
    deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here are Admin only
router.use(protect);
router.use(authorize('Admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .delete(deleteUser);

export default router;
