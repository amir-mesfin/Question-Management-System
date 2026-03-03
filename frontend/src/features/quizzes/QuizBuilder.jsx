import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaSearch, FaCheck, FaPlus, FaMinus } from 'react-icons/fa';
import useQuizStore from '../../store/quizStore';
import useQuestionStore from '../../store/questionStore';

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
    });

    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

    // For searching through available questions
    const [searchKeyword, setSearchKeyword] = useState('');
    const [questionPage, setQuestionPage] = useState(1);

    const loadQuestions = useCallback((keyword = '', page = 1) => {
        fetchQuestions({ keyword, page, status: 'Published' }); // Only fetch published questions for quizzes generally
    }, [fetchQuestions]);

    useEffect(() => {
        loadQuestions('', 1);
    }, [loadQuestions]);

    useEffect(() => {
        if (isEditMode) {
            fetchQuizById(id);
        }
    }, [isEditMode, id, fetchQuizById]);

    useEffect(() => {
        if (isEditMode && quiz) {
            setFormData({
                title: quiz.title || '',
                description: quiz.description || '',
                passingScore: quiz.passingScore || 70,
                timeLimit: quiz.timeLimit || 0,
                isPublished: quiz.isPublished || false,
            });
            // Extrac IDs from populated questions array
            const questionIds = quiz.questions?.map(q => typeof q === 'string' ? q : q._id) || [];
            setSelectedQuestionIds(questionIds);
        }
    }, [isEditMode, quiz]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadQuestions(searchKeyword, 1);
    };

    const toggleQuestionSelection = (questionId) => {
        setSelectedQuestionIds(prev => {
            if (prev.includes(questionId)) {
                return prev.filter(id => id !== questionId);
            } else {
                return [...prev, questionId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            questions: selectedQuestionIds,
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
            alert('Failed to save quiz. Please try again.');
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
                    <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Quiz' : 'Create New Quiz'}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Build your quiz by filling out details and selecting questions from the bank.
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
                {/* Left Column - Quiz Details */}
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
                                    placeholder="Instructions or details about this quiz..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (mins)</label>
                                    <input
                                        type="number"
                                        name="timeLimit"
                                        min="0"
                                        placeholder="0 for none"
                                        value={formData.timeLimit}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Set 0 for no limit</p>
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
                                        <p className="text-xs text-gray-500">Make this quiz visible to students.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <button
                                type="submit"
                                disabled={isQuizLoading || selectedQuestionIds.length === 0}
                                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaSave />
                                <span>{isEditMode ? 'Update Quiz' : 'Save Quiz'}</span>
                            </button>
                            {selectedQuestionIds.length === 0 && (
                                <p className="text-xs text-center text-red-500 mt-2">Please select at least one question.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Question Selection */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b pb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Select Questions</h3>
                                <p className="text-sm text-gray-500">{selectedQuestionIds.length} question(s) selected</p>
                            </div>

                            <div className="flex-1 w-full sm:max-w-xs">
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search question bank..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-blue-500">
                                        <FaSearch />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List of Questions */}
                        {isQuestionsLoading && questions.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No questions found. Try adjusting your search.
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {questions.map(question => {
                                    const isSelected = selectedQuestionIds.includes(question._id);

                                    return (
                                        <div
                                            key={question._id}
                                            onClick={() => toggleQuestionSelection(question._id)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1">
                                                    {isSelected ? (
                                                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                            <FaCheck className="text-xs" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                                            {question.type}
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${question.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                question.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                    'bg-red-50 text-red-700 border-red-200'
                                                            }`}>
                                                            {question.difficulty}
                                                        </span>
                                                    </div>
                                                    <h4 className={`text-base font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                        {question.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">Category: {question.category}</p>
                                                </div>
                                            </div>
                                        </div>
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
