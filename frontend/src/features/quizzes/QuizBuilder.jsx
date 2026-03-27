import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FaSave,
    FaTimes,
    FaSearch,
    FaCheck,
    FaPlus,
    FaArrowUp,
    FaArrowDown,
    FaTrash,
    FaUserFriends,
} from 'react-icons/fa';
import useQuizStore from '../../store/quizStore';
import useQuestionStore from '../../store/questionStore';
import api from '../../services/api';

const newClientKey = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `k-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const defaultCustomQuestion = () => ({
    source: 'custom',
    clientKey: newClientKey(),
    title: '',
    type: 'MCQ',
    difficulty: 'Medium',
    category: 'Custom',
    options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
    ],
    correctAnswerText: '',
    explanation: '',
    mediaUrl: '',
});

const QuizBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { createQuiz, updateQuiz, fetchQuizById, quiz, isLoading: isQuizLoading } = useQuizStore();
    const { questions, fetchQuestions, isLoading: isQuestionsLoading } = useQuestionStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        passingScore: 70,
        timeLimit: 0,
        isPublished: false,
        maxAttempts: 0,
        startTime: '',
        endTime: '',
    });

    /** Ordered mix: { source:'bank', questionId, previewTitle? } | custom fields + clientKey */
    const [items, setItems] = useState([]);
    const [allowedStudentIds, setAllowedStudentIds] = useState([]);
    const [students, setStudents] = useState([]);
    const [customDraft, setCustomDraft] = useState(defaultCustomQuestion);
    const [showCustomPanel, setShowCustomPanel] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState('');

    const loadQuestions = useCallback(
        (keyword = '', page = 1) => {
            fetchQuestions({ keyword, page, status: 'Published' });
        },
        [fetchQuestions]
    );

    useEffect(() => {
        loadQuestions('', 1);
    }, [loadQuestions]);

    useEffect(() => {
        api
            .get('/users/students')
            .then((res) => setStudents(res.data || []))
            .catch(() => setStudents([]));
    }, []);

    useEffect(() => {
        if (isEditMode) {
            fetchQuizById(id);
        }
    }, [isEditMode, id, fetchQuizById]);

    useEffect(() => {
        if (!isEditMode || !quiz) return;

        setFormData({
            title: quiz.title || '',
            description: quiz.description || '',
            passingScore: quiz.passingScore ?? 70,
            timeLimit: quiz.timeLimit ?? 0,
            isPublished: quiz.isPublished || false,
            maxAttempts: quiz.maxAttempts ?? 0,
            startTime: quiz.startTime ? new Date(quiz.startTime).toISOString().slice(0, 16) : '',
            endTime: quiz.endTime ? new Date(quiz.endTime).toISOString().slice(0, 16) : '',
        });

        const ids = (quiz.allowedStudents || []).map((u) =>
            typeof u === 'string' ? u : u._id || u
        );
        setAllowedStudentIds(ids);

        const resolved = quiz.questions || [];

        if (quiz.items?.length) {
            setItems(
                quiz.items.map((row, idx) => {
                    const bid = row.bankQuestionId;
                    if (bid) {
                        const q = resolved[idx];
                        return {
                            source: 'bank',
                            questionId: String(bid),
                            previewTitle: q?.title || '',
                        };
                    }
                    const emb = row.embedded || {};
                    return {
                        source: 'custom',
                        clientKey: newClientKey(),
                        title: emb.title || '',
                        type: emb.type || 'MCQ',
                        difficulty: emb.difficulty || 'Medium',
                        category: emb.category || 'Custom',
                        options:
                            emb.options?.length >= 2
                                ? emb.options.map((o) => ({
                                      text: o.text || '',
                                      isCorrect: Boolean(o.isCorrect),
                                  }))
                                : defaultCustomQuestion().options,
                        correctAnswerText: emb.correctAnswerText || '',
                        explanation: emb.explanation || '',
                        mediaUrl: emb.mediaUrl || '',
                    };
                })
            );
        } else if (resolved.length) {
            setItems(
                resolved.map((q) => ({
                    source: 'bank',
                    questionId: String(q._id),
                    previewTitle: q.title,
                }))
            );
        } else {
            setItems([]);
        }
    }, [isEditMode, quiz]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadQuestions(searchKeyword, 1);
    };

    const addBankQuestion = (q) => {
        const qid = String(q._id);
        if (items.some((it) => it.source === 'bank' && String(it.questionId) === qid)) return;
        setItems((prev) => [
            ...prev,
            { source: 'bank', questionId: qid, previewTitle: q.title },
        ]);
    };

    const removeItem = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const moveItem = (index, dir) => {
        setItems((prev) => {
            const next = [...prev];
            const j = index + dir;
            if (j < 0 || j >= next.length) return prev;
            [next[index], next[j]] = [next[j], next[index]];
            return next;
        });
    };

    const toggleAllowedStudent = (studentId) => {
        const sid = String(studentId);
        setAllowedStudentIds((prev) =>
            prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
        );
    };

    const setCorrectOptionIndex = (idx) => {
        setCustomDraft((prev) => ({
            ...prev,
            options: prev.options.map((o, i) => ({
                ...o,
                isCorrect: i === idx,
            })),
        }));
    };

    const updateCustomOptionText = (idx, text) => {
        setCustomDraft((prev) => ({
            ...prev,
            options: prev.options.map((o, i) => (i === idx ? { ...o, text } : o)),
        }));
    };

    const addCustomOption = () => {
        setCustomDraft((prev) => ({
            ...prev,
            options: [...prev.options, { text: '', isCorrect: false }],
        }));
    };

    const removeCustomOption = (idx) => {
        setCustomDraft((prev) => {
            if (prev.options.length <= 2) return prev;
            const options = prev.options.filter((_, i) => i !== idx);
            if (!options.some((o) => o.isCorrect)) options[0] = { ...options[0], isCorrect: true };
            return { ...prev, options };
        });
    };

    const appendCustomFromDraft = () => {
        const d = customDraft;
        if (!d.title.trim()) {
            alert('Add a title for the custom question.');
            return;
        }
        if (d.type === 'MCQ' || d.type === 'True/False') {
            const filled = d.options.filter((o) => o.text.trim());
            if (filled.length < 2) {
                alert('Add at least two answer options.');
                return;
            }
            if (!filled.some((o) => o.isCorrect)) {
                alert('Mark one correct option.');
                return;
            }
        }
        if (d.type === 'Fill-in-the-Blank' && !d.correctAnswerText.trim()) {
            alert('Add the correct answer for fill-in-the-blank.');
            return;
        }
        setItems((prev) => [
            ...prev,
            {
                ...d,
                clientKey: newClientKey(),
                options: d.options.map((o) => ({ ...o, text: o.text.trim() })),
                title: d.title.trim(),
                correctAnswerText: d.correctAnswerText.trim(),
            },
        ]);
        setCustomDraft(defaultCustomQuestion());
        setShowCustomPanel(false);
    };

    const buildPayloadItems = () =>
        items.map((it) => {
            if (it.source === 'bank') {
                return { source: 'bank', questionId: it.questionId };
            }
            const { clientKey, previewTitle, ...rest } = it;
            return {
                source: 'custom',
                title: rest.title,
                type: rest.type,
                difficulty: rest.difficulty,
                category: rest.category || 'Custom',
                options: rest.options || [],
                correctAnswerText: rest.correctAnswerText || '',
                explanation: rest.explanation || '',
                mediaUrl: rest.mediaUrl || '',
            };
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            alert('Add at least one question from the bank or create a custom one.');
            return;
        }

        const payload = {
            ...formData,
            passingScore: Number(formData.passingScore),
            timeLimit: Number(formData.timeLimit),
            maxAttempts: Number(formData.maxAttempts),
            items: buildPayloadItems(),
            allowedStudents: allowedStudentIds,
        };

        try {
            if (isEditMode) {
                await updateQuiz(id, payload);
                alert('Quiz updated successfully!');
            } else {
                await createQuiz(payload);
                alert('Quiz created successfully!');
            }
            navigate('/quizzes');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save quiz. Please try again.');
        }
    };

    if (isEditMode && isQuizLoading && !quiz) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Mix questions from the bank with your own. Schedule, attempts, and allowed students apply to
                        learners when the quiz is published.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/quizzes')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <FaTimes />
                    <span>Cancel</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Quiz Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g., Midterm Exam: Mathematics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Instructions for students..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Passing Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="passingScore"
                                        min="0"
                                        max="100"
                                        value={formData.passingScore}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Time Limit (mins)
                                    </label>
                                    <input
                                        type="number"
                                        name="timeLimit"
                                        min="0"
                                        placeholder="0 for none"
                                        value={formData.timeLimit}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                                <input
                                    type="number"
                                    name="maxAttempts"
                                    min="0"
                                    placeholder="0 for unlimited"
                                    value={formData.maxAttempts}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">0 = unlimited attempts for each student</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start (optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Students cannot open the quiz before this time</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End (optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Students cannot submit after this time</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isPublished"
                                        checked={formData.isPublished}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Publish Quiz</p>
                                        <p className="text-xs text-gray-500">Published quizzes appear to students (subject to schedule and access).</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={isQuizLoading || items.length === 0}
                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaSave />
                                <span>{isEditMode ? 'Update Quiz' : 'Save Quiz'}</span>
                            </button>
                            {items.length === 0 && (
                                <p className="text-xs text-center text-red-500 mt-2">Add at least one question.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FaUserFriends className="text-blue-600" />
                            Allowed students
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Leave none selected to allow all students. If you pick names, only those students will see
                            this quiz.
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-100 rounded-lg p-2">
                            {students.length === 0 ? (
                                <p className="text-sm text-gray-400">No students loaded.</p>
                            ) : (
                                students.map((s) => (
                                    <label
                                        key={s._id}
                                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={allowedStudentIds.includes(String(s._id))}
                                            onChange={() => toggleAllowedStudent(s._id)}
                                            className="rounded border-gray-300 text-blue-600"
                                        />
                                        <span className="font-medium text-gray-800">{s.name}</span>
                                        <span className="text-gray-400 text-xs">{s.email}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b pb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Quiz content (order)</h3>
                                <p className="text-sm text-gray-500">{items.length} question(s) in this quiz</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCustomPanel((v) => !v)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition"
                            >
                                <FaPlus /> Add custom question
                            </button>
                        </div>

                        {showCustomPanel && (
                            <div className="mb-6 p-4 border-2 border-blue-100 rounded-xl bg-blue-50/30 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                            Question text *
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={customDraft.title}
                                            onChange={(e) =>
                                                setCustomDraft((d) => ({ ...d, title: e.target.value }))
                                            }
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                            Type
                                        </label>
                                        <select
                                            value={customDraft.type}
                                            onChange={(e) => {
                                                const type = e.target.value;
                                                setCustomDraft((d) => ({
                                                    ...d,
                                                    type,
                                                    options:
                                                        type === 'True/False'
                                                            ? [
                                                                  { text: 'True', isCorrect: true },
                                                                  { text: 'False', isCorrect: false },
                                                              ]
                                                            : type === 'MCQ'
                                                              ? [
                                                                    { text: '', isCorrect: true },
                                                                    { text: '', isCorrect: false },
                                                                ]
                                                              : [],
                                                }));
                                            }}
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                        >
                                            <option value="MCQ">Multiple choice</option>
                                            <option value="True/False">True / False</option>
                                            <option value="Fill-in-the-Blank">Fill in the blank</option>
                                            <option value="Essay">Essay (not auto-graded)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                            Difficulty
                                        </label>
                                        <select
                                            value={customDraft.difficulty}
                                            onChange={(e) =>
                                                setCustomDraft((d) => ({ ...d, difficulty: e.target.value }))
                                            }
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                        >
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                </div>

                                {(customDraft.type === 'MCQ' || customDraft.type === 'True/False') && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Options (mark one correct)</p>
                                        {customDraft.options.map((opt, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="correctOpt"
                                                    checked={opt.isCorrect}
                                                    onChange={() => setCorrectOptionIndex(idx)}
                                                    className="text-blue-600"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={(e) => updateCustomOptionText(idx, e.target.value)}
                                                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                                {customDraft.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomOption(idx)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {customDraft.type === 'MCQ' && (
                                            <button
                                                type="button"
                                                onClick={addCustomOption}
                                                className="text-sm text-blue-600 font-bold"
                                            >
                                                + Add option
                                            </button>
                                        )}
                                    </div>
                                )}

                                {customDraft.type === 'Fill-in-the-Blank' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                            Correct answer (exact match, case-insensitive for grading)
                                        </label>
                                        <input
                                            type="text"
                                            value={customDraft.correctAnswerText}
                                            onChange={(e) =>
                                                setCustomDraft((d) => ({ ...d, correctAnswerText: e.target.value }))
                                            }
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Explanation (optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={customDraft.explanation}
                                        onChange={(e) =>
                                            setCustomDraft((d) => ({ ...d, explanation: e.target.value }))
                                        }
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={appendCustomFromDraft}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
                                    >
                                        Add to quiz
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomDraft(defaultCustomQuestion());
                                            setShowCustomPanel(false);
                                        }}
                                        className="px-4 py-2 border rounded-lg text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {items.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                Use the question bank below or add custom questions.
                            </p>
                        ) : (
                            <ul className="space-y-2 mb-6">
                                {items.map((it, idx) => (
                                    <li
                                        key={
                                            it.source === 'custom'
                                                ? it.clientKey
                                                : `bank-${it.questionId}-${idx}`
                                        }
                                        className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
                                    >
                                        <span className="text-xs font-black text-gray-400 w-6">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                {it.source === 'bank' ? 'Question bank' : 'Custom'}
                                            </span>
                                            <p className="font-medium text-gray-900 truncate">
                                                {it.source === 'bank'
                                                    ? it.previewTitle || `ID ${it.questionId}`
                                                    : it.title}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => moveItem(idx, -1)}
                                                className="p-2 text-gray-500 hover:bg-white rounded"
                                                disabled={idx === 0}
                                            >
                                                <FaArrowUp />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveItem(idx, 1)}
                                                className="p-2 text-gray-500 hover:bg-white rounded"
                                                disabled={idx === items.length - 1}
                                            >
                                                <FaArrowDown />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(idx)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Question bank</h3>
                                <p className="text-sm text-gray-500">Click a row to add it to the quiz (no duplicates)</p>
                            </div>
                            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <button
                                    type="submit"
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
                                >
                                    <FaSearch />
                                </button>
                            </form>
                        </div>

                        {isQuestionsLoading && questions.length === 0 ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No published questions found.</div>
                        ) : (
                            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                {questions.map((question) => {
                                    const inQuiz = items.some(
                                        (it) =>
                                            it.source === 'bank' && String(it.questionId) === String(question._id)
                                    );
                                    return (
                                        <button
                                            key={question._id}
                                            type="button"
                                            onClick={() => addBankQuestion(question)}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                inQuiz
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-200 hover:border-blue-400'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {inQuiz ? (
                                                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                            <FaCheck className="text-xs" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 text-lg leading-none">
                                                            +
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap gap-2 mb-1">
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border">
                                                            {question.type}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{question.category}</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                        {question.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QuizBuilder;
