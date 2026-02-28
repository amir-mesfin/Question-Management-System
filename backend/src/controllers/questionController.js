import Question from '../models/Question.js';

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private (Admin/Instructor)
export const createQuestion = async (req, res) => {
    try {
        const {
            title,
            type,
            difficulty,
            category,
            tags,
            status,
            options,
            correctAnswerText,
            explanation,
            mediaUrl,
        } = req.body;

        const question = new Question({
            title,
            type,
            difficulty,
            category,
            tags,
            status,
            options,
            correctAnswerText,
            explanation,
            mediaUrl,
            createdBy: req.user._id, // Set by authMiddleware
        });

        const createdQuestion = await question.save();
        res.status(201).json(createdQuestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all questions (with filtering & pagination)
// @route   GET /api/questions
// @access  Private
export const getQuestions = async (req, res) => {
    try {
        const { keyword, category, difficulty, status, page = 1, limit = 10 } = req.query;

        const query = {};

        // Search by keyword in title or tags
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { tags: { $in: [new RegExp(keyword, 'i')] } },
            ];
        }

        // Filter by specific attributes
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        // Only admins/instructors can see drafts, students only see published
        if (req.user.role === 'Student') {
            query.status = 'Published';
        } else if (status) {
            query.status = status;
        }

        const pageSize = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * pageSize;

        const questions = await Question.find(query)
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const total = await Question.countDocuments(query);

        res.json({
            questions,
            page: parseInt(page, 10),
            pages: Math.ceil(total / pageSize),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single question by ID
// @route   GET /api/questions/:id
// @access  Private
export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).populate('createdBy', 'name email');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Students cannot view draft questions
        if (req.user.role === 'Student' && question.status === 'Draft') {
            return res.status(403).json({ message: 'You are not authorized to view this draft question' });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Admin/Instructor)
export const updateQuestion = async (req, res) => {
    try {
        let question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Only Admin or the Instructor who created it can update
        if (req.user.role !== 'Admin' && question.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this question' });
        }

        question = await Question.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(question);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Admin/Instructor)
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Only Admin or the Instructor who created it can delete
        if (req.user.role !== 'Admin' && question.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }

        await question.deleteOne();

        res.json({ message: 'Question removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
