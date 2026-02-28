import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import useQuestionStore from '../../store/questionStore';
import useAuthStore from '../../store/authStore';

const QuestionList = () => {
    const { questions, isLoading, error, fetchQuestions, deleteQuestion } = useQuestionStore();
    const { user } = useAuthStore();

    const canManage = user?.role === 'Admin' || user?.role === 'Instructor';

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            await deleteQuestion(id);
        }
    };

    if (isLoading && questions.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and organize all questions</p>
                </div>
                {canManage && (
                    <Link
                        to="/questions/new"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                    >
                        <FaPlus />
                        <span className="hidden sm:inline">Add Question</span>
                    </Link>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                    <FaExclamationCircle />
                    <p>{error}</p>
                </div>
            )}

            {questions.length === 0 && !isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first question.</p>
                    {canManage && (
                        <Link
                            to="/questions/new"
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <FaPlus /> Create Question
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {questions.map((question) => (
                            <li key={question._id} className="p-4 sm:p-6 hover:bg-gray-50 transition duration-150">
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                    question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}
                                            >
                                                {question.difficulty}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200">
                                                {question.type}
                                            </span>
                                            {question.status === 'Draft' && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-medium border border-gray-200">
                                                    Draft
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                                            <Link to={`/questions/${question._id}`} className="hover:text-blue-600 transition">
                                                {question.title}
                                            </Link>
                                        </h4>

                                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                            <span>Category: <span className="font-medium text-gray-700">{question.category}</span></span>
                                            <span className="hidden sm:inline">&bull;</span>
                                            <span className="hidden sm:inline">Added by {question.createdBy?.name || 'Unknown'}</span>
                                        </div>

                                        {question.tags && question.tags.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {question.tags.map((tag, index) => (
                                                    <span key={index} className="inline-flex text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {canManage && (
                                        <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end sm:self-auto">
                                            <Link
                                                to={`/questions/${question._id}/edit`}
                                                className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 rounded shadow-sm transition"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(question._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 rounded shadow-sm transition"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default QuestionList;
