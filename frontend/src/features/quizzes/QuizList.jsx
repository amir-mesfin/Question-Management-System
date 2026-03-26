import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaExclamationCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaPlay, FaChartBar } from 'react-icons/fa';
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

    // Auto-refresh when an upcoming quiz starts
    useEffect(() => {
        const upcomingQuizzes = quizzes.filter(q => q.status === 'upcoming' && q.startTime);
        if (upcomingQuizzes.length === 0) return;

        // Find the earliest start time
        const now = new Date();
        const nextStartTime = Math.min(...upcomingQuizzes.map(q => new Date(q.startTime).getTime()));
        const delay = nextStartTime - now.getTime();

        if (delay > 0) {
            // Set a timeout to refresh the list exactly when the quiz starts (plus a small buffer)
            const timer = setTimeout(() => {
                loadQuizzes();
            }, delay + 1000); 

            return () => clearTimeout(timer);
        } else {
            // If the delay is already negative, it means a refresh is needed now
            loadQuizzes();
        }
    }, [quizzes, loadQuizzes]);

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
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quiz Library</h2>
                    <p className="text-sm text-gray-500 mt-1">Explore and manage available assessments</p>
                </div>
                {canManage && (
                    <Link
                        to="/quizzes/new"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-95"
                    >
                        <FaPlus />
                        <span>Create Quiz</span>
                    </Link>
                )}
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:border-blue-200">
                <form onSubmit={handleSearchSubmit} className="flex flex-col xl:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Search Quizzes</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-300" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 sm:text-sm transition-all"
                                placeholder="Search by quiz title..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>

                    {canManage && (
                        <div className="w-full xl:w-48">
                            <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                            <div className="relative">
                                <select
                                    name="isPublished"
                                    value={filters.isPublished}
                                    onChange={handleFilterChange}
                                    className="block w-full pl-4 pr-10 py-3 text-sm border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition-all appearance-none cursor-pointer font-bold text-gray-700"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="true">Published</option>
                                    <option value="false">Draft</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                    <FaFilter size={10} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 w-full xl:w-auto">
                        <button
                            type="submit"
                            className="flex-1 xl:flex-none px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all transform active:scale-95"
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
                                className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors transform active:scale-95"
                            >
                                <FaFilter />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                    <FaExclamationCircle />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {isLoading && quizzes.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : quizzes.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaSearch className="h-8 w-8 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No quizzes available</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">We couldn't find any quizzes matching your criteria. Try different search terms.</p>
                    {canManage && (
                        <Link
                            to="/quizzes/new"
                            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            <FaPlus /> Create Your First Quiz
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {quizzes.map((quiz) => (
                        <div key={quiz._id} className="group bg-white rounded-[2rem] p-6 sm:p-8 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {quiz.isPublished ? (
                                            <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
                                                Published
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-200">
                                                Draft
                                            </span>
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                            <FaChartBar size={12} className="text-blue-500" />
                                            {quiz.questions?.length || 0} Questions
                                        </span>
                                        {quiz.status && (
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                quiz.status === 'open' ? 'bg-green-50 text-green-600 border-green-100' :
                                                quiz.status === 'upcoming' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                quiz.status === 'closed' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                {quiz.status === 'open' ? 'Available' : quiz.status}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                        {quiz.timeLimit ? `${quiz.timeLimit}m` : 'No Limit'}
                                    </div>
                                </div>

                                <h4 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                    <Link to={`/quizzes/${quiz._id}`}>
                                        {quiz.title}
                                    </Link>
                                </h4>
                                
                                <div className="space-y-2 mb-6">
                                    <p className="text-gray-500 text-sm line-clamp-2 font-medium leading-relaxed">
                                        {quiz.description || "No description provided for this quiz."}
                                    </p>
                                    
                                    {/* Dates and Attempts */}
                                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest">
                                        {quiz.startTime && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-gray-400">Starts</span>
                                                <span className="text-gray-700">{new Date(quiz.startTime).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {quiz.endTime && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-gray-400">Ends</span>
                                                <span className="text-gray-700">{new Date(quiz.endTime).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {quiz.maxAttempts > 0 && user.role === 'Student' && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-gray-400">Attempts</span>
                                                <span className={quiz.attemptCount >= quiz.maxAttempts ? 'text-red-600' : 'text-green-600'}>
                                                    {quiz.attemptCount} / {quiz.maxAttempts} Used
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs border border-blue-100">
                                        {quiz.createdBy?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="text-[10px]">
                                        <span className="text-gray-400 block uppercase font-black tracking-widest">Instructor</span>
                                        <span className="text-gray-900 font-bold">{quiz.createdBy?.name || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {canManage && (
                                        <>
                                            <Link
                                                to={`/quizzes/${quiz._id}/edit`}
                                                className="p-3 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit Quiz"
                                            >
                                                <FaEdit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz._id)}
                                                className="p-3 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Quiz"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </>
                                    )}
                                    <Link
                                        to={`/quizzes/${quiz._id}`}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform group-active:scale-95 ${
                                            quiz.status === 'upcoming' 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none' 
                                            : quiz.status === 'closed' || quiz.status === 'finished'
                                            ? 'bg-red-50 text-red-400 cursor-not-allowed pointer-events-none'
                                            : 'bg-gray-900 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        <FaPlay size={10} />
                                        <span>
                                            {quiz.status === 'upcoming' ? 'Upcoming' :
                                             quiz.status === 'closed' ? 'Closed' :
                                             quiz.status === 'finished' ? 'No Retries' : 'Start Quiz'}
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-bold text-gray-400">
                        Page <span className="text-gray-900">{pagination.page}</span> of <span className="text-gray-900">{pagination.pages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-3 border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <div className="px-6 py-2 bg-blue-50 text-blue-600 font-black rounded-xl text-sm border border-blue-100">
                            {page}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page === pagination.pages}
                            className="p-3 border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
                        >
                            <FaChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizList;
