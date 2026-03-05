import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// Allow Instructors and Admins to upload images
router.post('/', protect, authorize('Admin', 'Instructor'), upload.single('image'), uploadImage);

export default router;
