import mongoose from 'mongoose';
import Question from '../models/Question.js';

const optionSchemaShape = (opts) => {
    if (!Array.isArray(opts)) return [];
    return opts
        .filter((o) => o && typeof o.text === 'string' && o.text.trim())
        .map((o) => ({
            text: o.text.trim(),
            isCorrect: Boolean(o.isCorrect),
        }));
};

/**
 * Build embedded subdocument from API payload (source === 'custom').
 */
export function buildEmbeddedFromPayload(row) {
    const title = (row.title || '').trim();
    if (!title) {
        throw new Error('Each custom question must have a title');
    }
    const type = row.type;
    const allowed = ['MCQ', 'True/False', 'Fill-in-the-Blank', 'Essay'];
    if (!allowed.includes(type)) {
        throw new Error(`Invalid question type: ${type}`);
    }
    const difficulty = ['Easy', 'Medium', 'Hard'].includes(row.difficulty) ? row.difficulty : 'Medium';
    const category = (row.category || 'Custom').trim() || 'Custom';
    const options = optionSchemaShape(row.options);

    if (type === 'MCQ' || type === 'True/False') {
        if (options.length < 2) {
            throw new Error(`${type} questions need at least two options`);
        }
        if (!options.some((o) => o.isCorrect)) {
            throw new Error(`${type} questions need exactly one correct option marked`);
        }
    }

    let correctAnswerText = (row.correctAnswerText || '').trim();
    if (type === 'Fill-in-the-Blank' && !correctAnswerText) {
        throw new Error('Fill-in-the-Blank questions need a correct answer');
    }

    return {
        _id: new mongoose.Types.ObjectId(),
        title,
        type,
        difficulty,
        category,
        options,
        correctAnswerText: correctAnswerText || undefined,
        explanation: row.explanation ? String(row.explanation).trim() : undefined,
        mediaUrl: row.mediaUrl ? String(row.mediaUrl).trim() : undefined,
    };
}

/**
 * Normalize items array from client: [{ source: 'bank', questionId }, { source: 'custom', ... }]
 */
export function sanitizeQuizItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Add at least one question (from the bank or custom)');
    }
    return items.map((row) => {
        if (row.source === 'bank' && row.questionId) {
            if (!mongoose.Types.ObjectId.isValid(row.questionId)) {
                throw new Error('Invalid bank question id');
            }
            return { bankQuestionId: row.questionId };
        }
        if (row.source === 'custom') {
            const embedded = buildEmbeddedFromPayload(row);
            return { embedded };
        }
        throw new Error('Each question must be from the bank (source: bank) or custom (source: custom)');
    });
}

/**
 * Resolve ordered question list for playing / grading (bank + embedded).
 */
export async function resolveQuizQuestions(quizDoc) {
    if (quizDoc.items && quizDoc.items.length > 0) {
        const bankIds = quizDoc.items
            .filter((i) => i.bankQuestionId)
            .map((i) => i.bankQuestionId);
        const bankMap = new Map();
        if (bankIds.length > 0) {
            const found = await Question.find({ _id: { $in: bankIds } }).lean();
            found.forEach((q) => bankMap.set(q._id.toString(), q));
        }
        const out = [];
        for (const item of quizDoc.items) {
            if (item.bankQuestionId) {
                const q = bankMap.get(item.bankQuestionId.toString());
                if (q) out.push(q);
            } else if (item.embedded) {
                const emb = item.embedded.toObject ? item.embedded.toObject() : { ...item.embedded };
                out.push(emb);
            }
        }
        return out;
    }

    await quizDoc.populate({ path: 'questions' });
    const qs = quizDoc.questions || [];
    return qs.map((q) => (q.toObject ? q.toObject() : q));
}

export function quizQuestionCount(quiz) {
    if (quiz.items && quiz.items.length > 0) return quiz.items.length;
    if (Array.isArray(quiz.questions)) return quiz.questions.length;
    return 0;
}
