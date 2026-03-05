import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Quiz',
    },
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    passed: {
        type: Boolean,
        required: true,
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        title: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        explanation: String
    }],
}, {
    timestamps: true,
});

const Attempt = mongoose.model('Attempt', attemptSchema);

export default Attempt;
