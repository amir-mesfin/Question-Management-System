import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaDownload, FaUpload, FaList, FaFolder } from 'react-icons/fa';
import useQuestionStore from '../../store/questionStore';
import useSubjectStore from '../../store/subjectStore';
import useAuthStore from '../../store/authStore';
import MathText from '../../components/MathText';

const QuestionList = () => {
    const { questions, isLoading, error, fetchQuestions, deleteQuestion, pagination, exportQuestions, importQuestions } = useQuestionStore();
    const { subjects, fetchSubjects } = useSubjectStore();
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const initialSubjectId = searchParams.get('subject') || '';

    const canManage = user?.role === 'Admin' || user?.role === 'Instructor';

    const [filters, setFilters] = useState({
        keyword: '',
        subject: initialSubjectId,
        difficulty: '',
        status: '',
    });

    const [page, setPage] = useState(1);

    // Use local state for the search input to prevent immediate re-fetching on every keystroke
    const [searchInput, setSearchInput] = useState('');

    const isShowingFolders = !filters.subject && !filters.keyword && !filters.difficulty && !filters.status;

    const loadQuestions = useCallback(() => {
        fetchQuestions({ ...filters, page });
    }, [fetchQuestions, filters, page]);

    useEffect(() => {
        loadQuestions();
        fetchSubjects();
    }, [loadQuestions, fetchSubjects]);

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Question Bank</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and organize all questions</p>
                </div>
                {canManage && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative overflow-hidden flex items-center flex-1 sm:flex-none">
                            <button type="button" className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-300 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer relative">
                                <FaUpload />
                                <span>Import</span>
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
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-300 rounded-xl font-bold text-sm shadow-sm transition-all"
                        >
                            <FaDownload />
                            <span>Export</span>
                        </button>

                        <Link
                            to="/questions/new"
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-95"
                        >
                            <FaPlus />
                            <span>Add Question</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:border-blue-200">
                <form onSubmit={handleSearchSubmit} className="flex flex-col xl:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Search Keywords</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-300" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 sm:text-sm transition-all"
                                placeholder="Search all questions..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full xl:w-auto">
                        <div className="w-full">
                            <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Difficulty</label>
                            <select
                                name="difficulty"
                                value={filters.difficulty}
                                onChange={handleFilterChange}
                                className="block w-full pl-4 pr-10 py-3 text-sm border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Difficulties</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Subject</label>
                            <select
                                name="subject"
                                value={filters.subject}
                                onChange={handleFilterChange}
                                className="block w-full pl-4 pr-10 py-3 text-sm border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition-all appearance-none cursor-pointer"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} {s.parentSubjectId ? `(Sub)` : ''}</option>
                                ))}
                            </select>
                        </div>

                        {canManage && (
                            <div className="w-full">
                                <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="block w-full pl-4 pr-10 py-3 text-sm border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 rounded-xl transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        <button
                            type="submit"
                            className="flex-1 lg:flex-none px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all transform active:scale-95"
                        >
                            Search
                        </button>

                        {(filters.keyword || filters.subject || filters.difficulty || filters.status) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setFilters({ keyword: '', subject: '', difficulty: '', status: '' });
                                    setSearchInput('');
                                    setPage(1);
                                }}
                                className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors transform active:scale-95"
                                title="Clear filters"
                            >
                                <FaFilter />
                            </button>
                        )}
                    </div>
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
            ) : isShowingFolders ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <button
                        onClick={() => { setFilters(prev => ({ ...prev, keyword: ' ' })); setPage(1); }}
                        className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full text-left"
                    >
                        <div className="flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center mb-6 group-hover:bg-gray-800 group-hover:text-white transition-colors duration-300">
                                <FaList size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-900 transition-colors">All Questions</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">View every question across all subjects in a single list.</p>
                        </div>
                    </button>
                    {subjects.map((subject) => (
                        <button
                            key={subject._id}
                            onClick={() => { setFilters(prev => ({ ...prev, subject: subject._id })); setPage(1); }}
                            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full text-left"
                        >
                            <div className="flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <FaFolder size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{subject.name}</h3>
                                {subject.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{subject.description}</p>
                                )}
                            </div>
                            
                            <div className="border-t border-gray-50 pt-4 mt-auto flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-wider">
                                    {subject.questionCount} {subject.questionCount === 1 ? 'Question' : 'Questions'}
                                </span>
                            </div>
                        </button>
                    ))}
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
                            <li key={question._id} className="group p-4 sm:p-6 hover:bg-blue-50/30 transition-all duration-300 border-l-4 border-transparent hover:border-blue-500">
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

                                        <div className="flex gap-4">
                                            {question.mediaUrl && (
                                                <div className="h-16 w-16 mb-2 flex-shrink-0 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                                    <img src={question.mediaUrl} alt="thumbnail" className="h-full w-full object-cover" />
                                                </div>
                                            )}

                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    <Link to={`/questions/${question._id}`}>
                                                        <MathText text={question.title} />
                                                    </Link>
                                                </h4>

                                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                                    <span>Subject: <span className="font-medium text-gray-700">{question.subject?.name || 'Uncategorized'}</span></span>
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
