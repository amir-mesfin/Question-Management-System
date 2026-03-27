import mongoose from 'mongoose';
import PracticeSession from '../models/PracticeSession.js';
import Subject from '../models/Subject.js';

// @desc    Record a completed practice run (subject drill)
// @route   POST /api/practice-sessions
// @access  Private
export const createPracticeSession = async (req, res) => {
    try {
        const { subjectId, correctCount, totalAnswered } = req.body;

        if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: 'Valid subjectId is required' });
        }

        const c = Number(correctCount);
        const t = Number(totalAnswered);
        if (!Number.isFinite(c) || !Number.isFinite(t) || c < 0 || t < 1 || c > t) {
            return res.status(400).json({ message: 'Invalid correctCount or totalAnswered' });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const percentage = Math.round((c / t) * 100);

        const session = await PracticeSession.create({
            user: req.user._id,
            subject: subjectId,
            correctCount: c,
            totalAnswered: t,
            percentage,
        });

        const populated = await PracticeSession.findById(session._id).populate('subject', 'name');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's practice sessions
// @route   GET /api/practice-sessions/my
// @access  Private
export const getMyPracticeSessions = async (req, res) => {
    try {
        const sessions = await PracticeSession.find({ user: req.user._id })
            .populate('subject', 'name')
            .sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
