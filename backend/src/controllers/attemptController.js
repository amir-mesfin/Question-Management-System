import Attempt from '../models/Attempt.js';

// @desc    Get logged in user's quiz attempts
// @route   GET /api/attempts/my
// @access  Private
export const getMyAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ user: req.user._id })
            .populate('quiz', 'title description')
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attempts for a specific quiz (Admin/Instructor only)
// @route   GET /api/attempts/quiz/:quizId
// @access  Private (Admin/Instructor)
export const getQuizAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ quiz: req.params.quizId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
