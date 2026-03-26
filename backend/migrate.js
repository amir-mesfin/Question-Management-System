import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './src/models/Question.js';
import Subject from './src/models/Subject.js';
import User from './src/models/User.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const admin = await User.findOne({ role: 'Admin' }) || await User.findOne();
        
        const questions = await mongoose.connection.collection('questions').find({}).toArray();
        if (questions.length === 0) {
            console.log('No questions to migrate.');
            process.exit(0);
        }

        const subjectsSet = new Set();
        questions.forEach(q => {
            if (q.category && typeof q.category === 'string') {
                subjectsSet.add(q.category);
            }
        });

        const createdSubjects = {};
        for (const catName of subjectsSet) {
            let doc = await Subject.findOne({ name: catName });
            if (!doc) {
                const adminId = admin ? admin._id : questions[0].createdBy;
                doc = new Subject({ name: catName, createdBy: adminId });
                await doc.save();
                console.log(`Created subject: ${catName}`);
            }
            createdSubjects[catName] = doc._id;
        }

        let uncategorized = await Subject.findOne({ name: 'Uncategorized' });
        if (!uncategorized) {
            const adminId = admin ? admin._id : questions[0].createdBy;
            uncategorized = new Subject({ name: 'Uncategorized', createdBy: adminId });
            await uncategorized.save();
            console.log('Created Uncategorized subject');
        }

        for (const q of questions) {
            if (!q.subject) {
                const subjId = (q.category && typeof q.category === 'string') ? createdSubjects[q.category] : uncategorized._id;
                await mongoose.connection.collection('questions').updateOne(
                    { _id: q._id },
                    { $set: { subject: subjId }, $unset: { category: "" } }
                );
            }
        }
        console.log('Migration completed');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

migrate();
