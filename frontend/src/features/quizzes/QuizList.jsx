import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaExclamationCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';
import useQuizStore from '../../store/quizStore';
import useAuthStore from '../../store/authStore';

const QuizList = () => {
    const { quizzes, isLoading, error, fetchQuizzes, deleteQuiz, pagination } = useQuizStore();
    const { user } = useAuthStore();

    const canManage = user?.role === 'Admin' || user?.role === 'Instructor';

    const [filters, setFilters] = useState({
        keyword: '',
        isPublished: '',
    });

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');

    const loadQuizzes = useCallback(() => {
        fetchQuizzes({ ...filters, page });
    }, [fetchQuizzes, filters, page]);

    useEffect(() => {
        loadQuizzes();
    }, [loadQuizzes]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            await deleteQuiz(id);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, keyword: searchInput }));
        setPage(1);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quiz Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and organize all quizzes</p>
                </div>
                {canManage && (
                    <Link
                        to="/quizzes/new"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                    >
                        <FaPlus />
                        <span className="hidden sm:inline">Create Quiz</span>
                    </Link>
                )}
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Keywords</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Search by title..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>

                    {canManage && (
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="isPublished"
                                value={filters.isPublished}
                                onChange={handleFilterChange}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">All Statuses</option>
                                <option value="true">Published</option>
                                <option value="false">Draft</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                    >
                        Search
                    </button>

                    {(filters.keyword || filters.isPublished !== '') && (
                        <button
                            type="button"
                            onClick={() => {
                                setFilters({ keyword: '', isPublished: '' });
                                setSearchInput('');
                                setPage(1);
                            }}
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                    <FaExclamationCircle />
                    <p>{error}</p>
                </div>
            )}

            {isLoading && quizzes.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FaFilter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
                    {canManage && (
                        <Link
                            to="/quizzes/new"
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <FaPlus /> Create Quiz
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                    <ul className="divide-y divide-gray-200">
                        {quizzes.map((quiz) => (
                            <li key={quiz._id} className="p-4 sm:p-6 hover:bg-gray-50 transition duration-150">
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            {quiz.isPublished ? (
                                                <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200">
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-medium border border-gray-200">
                                                    Draft
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                                            <Link to={`/quizzes/${quiz._id}`} className="hover:text-blue-600 transition">
                                                {quiz.title}
                                            </Link>
                                        </h4>
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{quiz.description}</p>

                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                            <span>Questions: <span className="font-medium text-gray-700">{quiz.questions?.length || 0}</span></span>
                                            <span className="hidden sm:inline">&bull;</span>
                                            <span>Time Limit: <span className="font-medium text-gray-700">{quiz.timeLimit ? `${quiz.timeLimit} mins` : 'None'}</span></span>
                                            <span className="hidden sm:inline">&bull;</span>
                                            <span>Added by {quiz.createdBy?.name || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end sm:self-auto">
                                        <Link
                                            to={`/quizzes/${quiz._id}`}
                                            className="p-2 text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded shadow-sm transition"
                                            title="View/Take Quiz"
                                        >
                                            <FaPlay />
                                        </Link>
                                        {canManage && (
                                            <>
                                                <Link
                                                    to={`/quizzes/${quiz._id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 rounded shadow-sm transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(quiz._id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 rounded shadow-sm transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Pagination Controls */}
                    {pagination && pagination.pages > 1 && (
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.pages}</span> (Total <span className="font-medium">{pagination.total}</span> quizzes)
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            {page}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                            disabled={page === pagination.pages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <span className="sr-only">Next</span>
                                            <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizList;
