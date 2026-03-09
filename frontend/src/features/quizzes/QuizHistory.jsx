import React, { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaCheckCircle, FaTimesCircle, FaChevronRight, FaCalendarAlt, FaAward } from 'react-icons/fa';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import MathText from '../../components/MathText';

const QuizHistory = () => {
    const [attempts, setAttempts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/api/attempts/my');
            setAttempts(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch history');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Quiz History</h2>
                    <p className="text-gray-500 font-medium mt-1">Review your performance and progress</p>
                </div>
                <Link to="/quizzes" className="hidden sm:block text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition">Take More Quizzes</Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 font-medium">
                    <FaTimesCircle /> {error}
                </div>
            )}

            {attempts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaHistory className="text-gray-300 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No attempts yet</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">You haven't taken any quizzes yet. Start learning today!</p>
                    <Link
                        to="/quizzes"
                        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition transform active:scale-95"
                    >
                        Browse Quizzes
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {attempts.map((attempt) => (
                        <div
                            key={attempt._id}
                            className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xl hover:shadow-blue-900/5 transition duration-300 group"
                        >
                            <div className="flex items-center gap-5 w-full sm:w-auto">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${attempt.passed ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                                    }`}>
                                    {attempt.passed ? <FaCheckCircle size={24} /> : <FaTimesCircle size={24} />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition">
                                        {attempt.quiz?.title ? <MathText text={attempt.quiz.title} /> : 'Deleted Quiz'}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><FaCalendarAlt /> {new Date(attempt.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><FaAward /> {attempt.passed ? 'PASSED' : 'FAILED'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-12 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50">
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-gray-900 leading-none">{attempt.percentage}%</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block">Score</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xl font-bold text-gray-700 leading-none">{attempt.score}/{attempt.totalQuestions}</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block">Correct</span>
                                </div>
                                <Link
                                    to={`/quizzes/${attempt.quiz?._id}`}
                                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition group-hover:scale-110"
                                >
                                    <FaChevronRight />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizHistory;
