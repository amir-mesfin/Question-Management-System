import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Admin/Instructor)
export const createQuiz = async (req, res) => {
    try {
        const { title, description, questions, passingScore, timeLimit, isPublished, maxAttempts, startTime, endTime } = req.body;

        const quiz = new Quiz({
            title,
            description,
            questions,
            passingScore,
            timeLimit,
            isPublished,
            maxAttempts,
            startTime,
            endTime,
            createdBy: req.user._id,
        });

        const createdQuiz = await quiz.save();
        res.status(201).json(createdQuiz);
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

        // Isolation: Students see published. Instructors see own. Admins see all.
        if (req.user.role === 'Student') {
            query.isPublished = true;
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

        // For students, add attempt info and status
        let results = quizzes;
        if (req.user.role === 'Student') {
            const now = new Date();
            results = await Promise.all(quizzes.map(async (quiz) => {
                const attemptCount = await Attempt.countDocuments({ user: req.user._id, quiz: quiz._id });
                
                let status = 'open';
                if (quiz.startTime && now < quiz.startTime) status = 'upcoming';
                else if (quiz.endTime && now > quiz.endTime) status = 'closed';
                else if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) status = 'finished';

                return {
                    ...quiz.toObject(),
                    attemptCount,
                    status
                };
            }));
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
        const quiz = await Quiz.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('questions'); // Populate the actual questions

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Restriction: Time Windows
        const now = new Date();
        if (quiz.startTime && now < quiz.startTime) {
            return res.status(403).json({ message: `This quiz is not available until ${quiz.startTime.toLocaleString()}` });
        }
        if (quiz.endTime && now > quiz.endTime) {
            return res.status(403).json({ message: 'This quiz has expired' });
        }

        // Restriction: Allowed Students
        if (quiz.allowedStudents && quiz.allowedStudents.length > 0) {
            const isAllowed = quiz.allowedStudents.some(id => id.toString() === req.user._id.toString());
            if (!isAllowed) {
                return res.status(403).json({ message: 'You are not in the list of allowed students for this quiz' });
            }
        }

        // Restriction: Max Attempts
        if (quiz.maxAttempts > 0) {
            const attemptCount = await Attempt.countDocuments({ user: req.user._id, quiz: quiz._id });
            if (attemptCount >= quiz.maxAttempts) {
                return res.status(403).json({ message: `You have reached the maximum limit of ${quiz.maxAttempts} attempts for this quiz` });
            }
        }

        res.json(quiz);
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

        // Only Admin or the Instructor who created it can update
        if (req.user.role !== 'Admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this quiz' });
        }

        quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

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

        // Only Admin or the Instructor who created it can delete
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
        const { answers } = req.body; // Array of { questionId, answerText }
        const quiz = await Quiz.findById(req.params.id).populate('questions');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Re-enforce restrictions on submission (security)
        const now = new Date();
        if (quiz.startTime && now < quiz.startTime) {
            return res.status(403).json({ message: 'Quiz is not yet available' });
        }
        if (quiz.endTime && now > quiz.endTime) {
            return res.status(403).json({ message: 'Quiz window has closed' });
        }

        if (quiz.allowedStudents && quiz.allowedStudents.length > 0) {
            if (!quiz.allowedStudents.some(id => id.toString() === req.user._id.toString())) {
                return res.status(403).json({ message: 'You are not authorized to take this quiz' });
            }
        }

        if (quiz.maxAttempts > 0) {
            const attemptCount = await Attempt.countDocuments({ user: req.user._id, quiz: quiz._id });
            if (attemptCount >= quiz.maxAttempts) {
                return res.status(403).json({ message: 'Maximum attempts reached for this quiz' });
            }
        }

        let score = 0;
        const totalQuestions = quiz.questions.length;
        const results = [];

        quiz.questions.forEach((question) => {
            const userAnswer = answers.find(a => a.questionId === question._id.toString());
            
            let isCorrect = false;
            let actualCorrectAnswer = question.correctAnswerText || '';

            if (question.type === 'MCQ' || question.type === 'True/False') {
                const correctOption = question.options.find(opt => opt.isCorrect);
                if (correctOption) {
                    actualCorrectAnswer = correctOption.text;
                }
                isCorrect = userAnswer && userAnswer.answerText === actualCorrectAnswer;
            } else {
                // For Fill-in-the-Blank, we might want case-insensitive comparison
                if (userAnswer && userAnswer.answerText && question.correctAnswerText) {
                    isCorrect = userAnswer.answerText.trim().toLowerCase() === question.correctAnswerText.trim().toLowerCase();
                } else {
                    isCorrect = false;
                }
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
                explanation: question.explanation
            });
        });

        const percentage = (score / totalQuestions) * 100;
        const passed = percentage >= quiz.passingScore;

        // Save the attempt to the database
        const attempt = new Attempt({
            user: req.user._id,
            quiz: quiz._id,
            score,
            totalQuestions,
            percentage: Math.round(percentage),
            passed,
            answers: results
        });

        await attempt.save();

        res.json({
            score,
            totalQuestions,
            percentage: Math.round(percentage),
            passed,
            results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

