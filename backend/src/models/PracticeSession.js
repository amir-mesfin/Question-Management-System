import mongoose from 'mongoose';

const practiceSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Subject',
        },
        correctCount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalAnswered: {
            type: Number,
            required: true,
            min: 1,
        },
        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
    }
);

const PracticeSession = mongoose.model('PracticeSession', practiceSessionSchema);
export default PracticeSession;
