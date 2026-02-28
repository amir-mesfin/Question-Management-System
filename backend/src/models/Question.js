import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a question title/text'],
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Please specify the question type'],
            enum: ['MCQ', 'True/False', 'Fill-in-the-Blank', 'Essay'],
        },
        difficulty: {
            type: String,
            required: [true, 'Please specify difficulty'],
            enum: ['Easy', 'Medium', 'Hard'],
            default: 'Medium',
        },
        category: {
            type: String,
            required: [true, 'Please specify a category or subject'],
            trim: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        status: {
            type: String,
            enum: ['Draft', 'Published'],
            default: 'Published',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Type-specific fields
        // For MCQ and True/False
        options: [optionSchema],

        // For Fill-in-the-Blank or specific exact match validation
        correctAnswerText: {
            type: String,
            trim: true,
        },

        // For Essay or detailed explanations
        explanation: {
            type: String,
        },

        // Optional media support
        mediaUrl: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
