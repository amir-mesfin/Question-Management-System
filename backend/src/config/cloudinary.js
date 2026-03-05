import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'qms_uploads', // Folder name in your Cloudinary account
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        // Optional: transformation: [{ width: 800, height: 800, crop: 'limit' }]
    },
});

const upload = multer({ storage: storage });

export default upload;
