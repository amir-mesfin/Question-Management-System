import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a quiz title'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            }
        ],
        passingScore: {
            type: Number,
            default: 70, // percentage
        },
        timeLimit: {
            type: Number, // in minutes, 0 or null for no limit
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        allowedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ],
        maxAttempts: {
            type: Number,
            default: 0, // 0 means unlimited
        },
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
