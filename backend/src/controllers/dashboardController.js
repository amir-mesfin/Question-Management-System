import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin/Instructor)
export const getStats = async (req, res) => {
    try {
        const stats = {
            totalQuestions: await Question.countDocuments(),
            totalQuizzes: await Quiz.countDocuments(),
            totalUsers: await User.countDocuments(),
        };

        // If Instructor, restrict some stats or provide user-specific ones
        if (req.user.role === 'Instructor') {
            stats.myQuestions = await Question.countDocuments({ createdBy: req.user._id });
            stats.myQuizzes = await Quiz.countDocuments({ createdBy: req.user._id });
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get question distribution by type and difficulty
// @route   GET /api/dashboard/distribution
// @access  Private (Admin/Instructor)
export const getDistribution = async (req, res) => {
    try {
        const typeDistribution = await Question.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]);

        const difficultyDistribution = await Question.aggregate([
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ]);

        res.json({
            types: typeDistribution,
            difficulties: difficultyDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent activity (latest questions and quizzes)
// @route   GET /api/dashboard/activity
// @access  Private (Admin/Instructor)
export const getRecentActivity = async (req, res) => {
    try {
        const recentQuestions = await Question.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'name');

        const recentQuizzes = await Quiz.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'name');

        res.json({
            questions: recentQuestions,
            quizzes: recentQuizzes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
