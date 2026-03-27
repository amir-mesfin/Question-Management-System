import mongoose from 'mongoose';

const quizOptionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
    },
    { _id: false }
);

const embeddedQuizQuestionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        type: {
            type: String,
            required: true,
            enum: ['MCQ', 'True/False', 'Fill-in-the-Blank', 'Essay'],
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium',
        },
        category: { type: String, default: 'Custom', trim: true },
        options: [quizOptionSchema],
        correctAnswerText: { type: String, trim: true },
        explanation: { type: String },
        mediaUrl: { type: String },
    },
    { _id: true }
);

const quizItemSchema = new mongoose.Schema(
    {
        bankQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        embedded: { type: embeddedQuizQuestionSchema },
    },
    { _id: false }
);

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
        /** @deprecated Legacy quizzes: ObjectId refs only. Prefer `items`. */
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Question',
            },
        ],
        /** Ordered mix of bank questions and quiz-only (embedded) questions */
        items: [quizItemSchema],
        passingScore: {
            type: Number,
            default: 70,
        },
        timeLimit: {
            type: Number,
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
            },
        ],
        maxAttempts: {
            type: Number,
            default: 0,
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
        },
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
