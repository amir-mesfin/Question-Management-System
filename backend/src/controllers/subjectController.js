import Subject from '../models/Subject.js';
import Question from '../models/Question.js';

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Admin/Instructor)
export const createSubject = async (req, res) => {
    try {
        const { name, description, parentSubjectId } = req.body;

        const subjectExists = await Subject.findOne({ name });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        const subject = new Subject({
            name,
            description,
            parentSubjectId: parentSubjectId || null,
            createdBy: req.user._id,
        });

        const createdSubject = await subject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find().populate('parentSubjectId', 'name').sort({ name: 1 });

        // Add question counts
        const subjectsWithCounts = await Promise.all(
            subjects.map(async (subject) => {
                const count = await Question.countDocuments({ subject: subject._id });
                return {
                    ...subject.toObject(),
                    questionCount: count,
                };
            })
        );

        res.json(subjectsWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin/Instructor)
export const updateSubject = async (req, res) => {
    try {
        const { name, description, parentSubjectId } = req.body;

        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        subject.name = name || subject.name;
        subject.description = description !== undefined ? description : subject.description;
        subject.parentSubjectId = parentSubjectId !== undefined ? parentSubjectId : subject.parentSubjectId;

        const updatedSubject = await subject.save();
        res.json(updatedSubject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin/Instructor)
export const deleteSubject = async (req, res) => {
    try {
        const { action, fallbackSubjectId } = req.body; 
        
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Handle questions based on chosen action
        if (action === 'delete_questions') {
            await Question.deleteMany({ subject: subject._id });
        } else if (action === 'archive_questions' || action === 'reassign_questions') {
            let targetSubjectId = fallbackSubjectId;
            // Create fallback 'Uncategorized' if none provided
            if (!targetSubjectId) {
                let uncategorized = await Subject.findOne({ name: 'Uncategorized' });
                if (!uncategorized) {
                    uncategorized = new Subject({ name: 'Uncategorized', createdBy: req.user._id });
                    await uncategorized.save();
                }
                targetSubjectId = uncategorized._id;
            }

            const updatePayload = { subject: targetSubjectId };
            if (action === 'archive_questions') {
                updatePayload.status = 'Archived';
            }

            await Question.updateMany({ subject: subject._id }, { $set: updatePayload });
        }

        // Sub-subjects need to be handled, we orphan them (parent = null)
        await Subject.updateMany({ parentSubjectId: subject._id }, { $set: { parentSubjectId: null } });

        await subject.deleteOne();
        res.json({ message: 'Subject removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
