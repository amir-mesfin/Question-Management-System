import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import {
    sanitizeQuizItems,
    resolveQuizQuestions,
    quizQuestionCount,
} from '../utils/quizQuestions.js';

function parseAllowedStudents(raw) {
    if (!Array.isArray(raw)) return undefined;
    return raw.filter((id) => mongoose.Types.ObjectId.isValid(id));
}

function parseQuizMeta(body, { partial = false } = {}) {
    const meta = {};

    if (!partial || body.title !== undefined) {
        meta.title = (body.title || '').trim();
    }
    if (!partial || body.description !== undefined) {
        meta.description = body.description != null ? String(body.description).trim() : '';
    }
    if (!partial || body.passingScore !== undefined) {
        const n = Number(body.passingScore);
        meta.passingScore = Number.isFinite(n)
            ? Math.min(100, Math.max(0, n))
            : partial
              ? undefined
              : 70;
    }
    if (!partial || body.timeLimit !== undefined) {
        const n = Number(body.timeLimit);
        meta.timeLimit = Number.isFinite(n) ? Math.max(0, n) : partial ? undefined : 0;
    }
    if (!partial || body.maxAttempts !== undefined) {
        const n = Number(body.maxAttempts);
        meta.maxAttempts = Number.isFinite(n) ? Math.max(0, n) : partial ? undefined : 0;
    }
    if (!partial || body.isPublished !== undefined) {
        meta.isPublished = Boolean(body.isPublished);
    }

    if (!partial || body.startTime !== undefined) {
        if (body.startTime === '' || body.startTime === null || body.startTime === undefined) {
            meta.startTime = null;
        } else {
            const d = new Date(body.startTime);
            meta.startTime = Number.isNaN(d.getTime()) ? null : d;
        }
    }

    if (!partial || body.endTime !== undefined) {
        if (body.endTime === '' || body.endTime === null || body.endTime === undefined) {
            meta.endTime = null;
        } else {
            const d = new Date(body.endTime);
            meta.endTime = Number.isNaN(d.getTime()) ? null : d;
        }
    }

    if (!partial || body.allowedStudents !== undefined) {
        const ids = parseAllowedStudents(body.allowedStudents);
        meta.allowedStudents = ids !== undefined ? ids : [];
    }

    return meta;
}

// Quizzes open to everyone (no allowed list) OR user is explicitly allowed
function studentAllowedFilter(userId) {
    return {
        $or: [
            { 'allowedStudents.0': { $exists: false } },
            { allowedStudents: userId },
        ],
    };
}

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Admin/Instructor)
export const createQuiz = async (req, res) => {
    try {
        const meta = parseQuizMeta(req.body, { partial: false });
        if (!meta.title) {
            return res.status(400).json({ message: 'Quiz title is required' });
        }

        let items = [];
        let questions = [];

        if (Array.isArray(req.body.items) && req.body.items.length > 0) {
            items = sanitizeQuizItems(req.body.items);
        } else if (Array.isArray(req.body.questions) && req.body.questions.length > 0) {
            questions = req.body.questions;
        } else {
            return res.status(400).json({ message: 'Add at least one question (bank or custom)' });
        }

        const quiz = await Quiz.create({
            ...meta,
            items,
            questions,
            createdBy: req.user._id,
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all quizzes (with filtering & pagination)
// @route   GET /api/quizzes
// @access  Private
export const getQuizzes = async (req, res) => {
    try {
        const { keyword, isPublished, page = 1, limit = 10 } = req.query;

        const query = {};

        if (keyword) {
            query.title = { $regex: keyword, $options: 'i' };
        }

        if (req.user.role === 'Student') {
            query.isPublished = true;
            Object.assign(query, studentAllowedFilter(req.user._id));
        } else if (req.user.role === 'Instructor') {
            query.createdBy = req.user._id;
        } else if (isPublished === 'true' || isPublished === 'false') {
            query.isPublished = isPublished === 'true';
        }

        const pageSize = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * pageSize;

        const quizzes = await Quiz.find(query)
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const total = await Quiz.countDocuments(query);

        const withCount = quizzes.map((quiz) => {
            const o = quiz.toObject();
            o.questionCount = quizQuestionCount(quiz);
            return o;
        });

        let results = withCount;
        if (req.user.role === 'Student') {
            const now = new Date();
            results = await Promise.all(
                withCount.map(async (quiz) => {
                    const attemptCount = await Attempt.countDocuments({
                        user: req.user._id,
                        quiz: quiz._id,
                    });

                    let status = 'open';
                    if (quiz.startTime && now < new Date(quiz.startTime)) status = 'upcoming';
                    else if (quiz.endTime && now > new Date(quiz.endTime)) status = 'closed';
                    else if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) status = 'finished';

                    return {
                        ...quiz,
                        attemptCount,
                        status,
                    };
                })
            );
        }

        res.json({
            quizzes: results,
            page: parseInt(page, 10),
            pages: Math.ceil(total / pageSize),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name email');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const isStudent = req.user.role === 'Student';
        const now = new Date();

        if (isStudent) {
            if (!quiz.isPublished) {
                return res.status(403).json({ message: 'This quiz is not available' });
            }

            if (quiz.startTime && now < quiz.startTime) {
                return res.status(403).json({
                    message: `This quiz is not available until ${quiz.startTime.toLocaleString()}`,
                });
            }
            if (quiz.endTime && now > quiz.endTime) {
                return res.status(403).json({ message: 'This quiz has expired' });
            }

            if (quiz.allowedStudents && quiz.allowedStudents.length > 0) {
                const isAllowed = quiz.allowedStudents.some(
                    (id) => id.toString() === req.user._id.toString()
                );
                if (!isAllowed) {
                    return res.status(403).json({
                        message: 'You are not in the list of allowed students for this quiz',
                    });
                }
            }

            if (quiz.maxAttempts > 0) {
                const attemptCount = await Attempt.countDocuments({
                    user: req.user._id,
                    quiz: quiz._id,
                });
                if (attemptCount >= quiz.maxAttempts) {
                    return res.status(403).json({
                        message: `You have reached the maximum limit of ${quiz.maxAttempts} attempts for this quiz`,
                    });
                }
            }
        }

        const questions = await resolveQuizQuestions(quiz);
        const base = quiz.toObject();
        base.questions = questions;
        base.questionCount = questions.length;
        if (!isStudent) {
            base.items = quiz.items;
        }

        res.json(base);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Admin/Instructor)
export const updateQuiz = async (req, res) => {
    try {
        let quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (req.user.role !== 'Admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this quiz' });
        }

        const meta = parseQuizMeta(req.body, { partial: true });
        const updatePayload = Object.fromEntries(
            Object.entries(meta).filter(([, v]) => v !== undefined)
        );

        if (Array.isArray(req.body.items)) {
            if (req.body.items.length === 0) {
                return res.status(400).json({ message: 'Add at least one question' });
            }
            updatePayload.items = sanitizeQuizItems(req.body.items);
            updatePayload.questions = [];
        }

        quiz = await Quiz.findByIdAndUpdate(req.params.id, { $set: updatePayload }, {
            new: true,
            runValidators: true,
        });

        res.json(quiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin/Instructor)
export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (req.user.role !== 'Admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await quiz.deleteOne();

        res.json({ message: 'Quiz removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit quiz answers and get score
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body;
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (!quiz.isPublished) {
            return res.status(403).json({ message: 'Quiz is not available' });
        }

        const now = new Date();
        if (quiz.startTime && now < quiz.startTime) {
            return res.status(403).json({ message: 'Quiz is not yet available' });
        }
        if (quiz.endTime && now > quiz.endTime) {
            return res.status(403).json({ message: 'Quiz window has closed' });
        }

        if (quiz.allowedStudents && quiz.allowedStudents.length > 0) {
            if (!quiz.allowedStudents.some((id) => id.toString() === req.user._id.toString())) {
                return res.status(403).json({ message: 'You are not authorized to take this quiz' });
            }
        }

        if (quiz.maxAttempts > 0) {
            const attemptCount = await Attempt.countDocuments({
                user: req.user._id,
                quiz: quiz._id,
            });
            if (attemptCount >= quiz.maxAttempts) {
                return res.status(403).json({ message: 'Maximum attempts reached for this quiz' });
            }
        }

        const resolvedQuestions = await resolveQuizQuestions(quiz);
        if (resolvedQuestions.length === 0) {
            return res.status(400).json({ message: 'This quiz has no questions' });
        }

        let score = 0;
        const totalQuestions = resolvedQuestions.length;
        const results = [];

        resolvedQuestions.forEach((question) => {
            const userAnswer = answers.find((a) => a.questionId === question._id.toString());

            let isCorrect = false;
            let actualCorrectAnswer = question.correctAnswerText || '';

            if (question.type === 'MCQ' || question.type === 'True/False') {
                const correctOption = question.options?.find((opt) => opt.isCorrect);
                if (correctOption) {
                    actualCorrectAnswer = correctOption.text;
                }
                isCorrect = userAnswer && userAnswer.answerText === actualCorrectAnswer;
            } else if (question.type === 'Fill-in-the-Blank') {
                if (userAnswer && userAnswer.answerText && question.correctAnswerText) {
                    isCorrect =
                        userAnswer.answerText.trim().toLowerCase() ===
                        question.correctAnswerText.trim().toLowerCase();
                } else {
                    isCorrect = false;
                }
            } else {
                isCorrect = false;
            }

            if (isCorrect) {
                score++;
            }

            results.push({
                questionId: question._id,
                title: question.title,
                userAnswer: userAnswer ? userAnswer.answerText : null,
                correctAnswer: actualCorrectAnswer,
                isCorrect,
                explanation: question.explanation,
            });
        });

        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= quiz.passingScore;

        const attempt = new Attempt({
            user: req.user._id,
            quiz: quiz._id,
            score,
            totalQuestions,
            percentage: Math.round(percentage),
            passed,
            answers: results,
        });

        await attempt.save();

        res.json({
            score,
            totalQuestions,
            percentage: Math.round(percentage),
            passed,
            results,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
