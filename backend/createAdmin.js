import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('password123', salt);
        
        let admin = await User.findOne({ email: 'admin@test.com' });
        if (!admin) {
            admin = new User({
                name: 'Test Admin',
                email: 'admin@test.com',
                password: passwordHash,
                role: 'Admin'
            });
            await admin.save();
            console.log('Created Admin user: admin@test.com / password123');
        } else {
            admin.password = passwordHash;
            admin.role = 'Admin';
            await admin.save();
            console.log('Updated Admin user: admin@test.com / password123');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

createAdmin();
