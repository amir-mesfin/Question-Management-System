import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaDownload, FaUpload } from 'react-icons/fa';
import useQuestionStore from '../../store/questionStore';
import useAuthStore from '../../store/authStore';

const QuestionList = () => {
    const { questions, isLoading, error, fetchQuestions, deleteQuestion, pagination, exportQuestions, importQuestions } = useQuestionStore();
    const { user } = useAuthStore();

    const canManage = user?.role === 'Admin' || user?.role === 'Instructor';

    const [filters, setFilters] = useState({
        keyword: '',
        category: '',
        difficulty: '',
        status: '',
    });

    const [page, setPage] = useState(1);

    // Use local state for the search input to prevent immediate re-fetching on every keystroke
    const [searchInput, setSearchInput] = useState('');

    const loadQuestions = useCallback(() => {
        fetchQuestions({ ...filters, page });
    }, [fetchQuestions, filters, page]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            await deleteQuestion(id);
            // Reload if current page becomes empty? For simplicity, we can just rely on the store's filter function which removes it instantly from UI
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, keyword: searchInput }));
        setPage(1); // Reset to first page on new search
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to first page on filter change
    };

    const handleExport = async () => {
        try {
            await exportQuestions();
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export questions.');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                await importQuestions(json);
                alert('Questions imported successfully!');
                e.target.value = null;
            } catch (err) {
                console.error('Import failed:', err);
                alert('Failed to import questions. Please ensure the JSON format is correct.');
                e.target.value = null;
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and organize all questions</p>
                </div>
                {canManage && (
                    <div className="flex items-center gap-3">
                        <div className="relative overflow-hidden flex items-center">
                            <button type="button" className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-300 rounded-lg font-medium shadow-sm transition-colors cursor-pointer relative">
                                <FaUpload />
                                <span className="hidden sm:inline">Import</span>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title="Import JSON"
                                />
                            </button>
                        </div>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-300 rounded-lg font-medium shadow-sm transition-colors"
                        >
                            <FaDownload />
                            <span className="hidden sm:inline">Export</span>
                        </button>

                        <Link
                            to="/questions/new"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
                        >
                            <FaPlus />
                            <span className="hidden sm:inline">Add Question</span>
                        </Link>
                    </div>
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
                                placeholder="Search by title or tags..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                        <select
                            name="difficulty"
                            value={filters.difficulty}
                            onChange={handleFilterChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="">All Difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            placeholder="e.g. Mathematics"
                            className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    {canManage && (
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">All Statuses</option>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                    >
                        Search
                    </button>

                    {(filters.keyword || filters.category || filters.difficulty || filters.status) && (
                        <button
                            type="button"
                            onClick={() => {
                                setFilters({ keyword: '', category: '', difficulty: '', status: '' });
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

            {isLoading && questions.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : questions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FaFilter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
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
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden flex flex-col">
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

                    {/* Pagination Controls */}
                    {pagination && pagination.pages > 1 && (
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.pages}</span> (Total <span className="font-medium">{pagination.total}</span> questions)
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

                            {/* Mobile pagination */}
                            <div className="flex w-full items-center justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-700">Page {page} of {pagination.pages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionList;
