import Quiz from '../models/Quiz.js';

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Admin/Instructor)
export const createQuiz = async (req, res) => {
    try {
        const { title, description, questions, passingScore, timeLimit, isPublished } = req.body;

        const quiz = new Quiz({
            title,
            description,
            questions,
            passingScore,
            timeLimit,
            isPublished,
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

        // Students only see published quizzes
        if (req.user.role === 'Student') {
            query.isPublished = true;
        } else if (isPublished !== undefined) {
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

        res.json({
            quizzes,
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

        // Students cannot view unpublished quizzes
        if (req.user.role === 'Student' && !quiz.isPublished) {
            return res.status(403).json({ message: 'You are not authorized to view this quiz' });
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
