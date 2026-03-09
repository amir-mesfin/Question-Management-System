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
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quiz History</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Review your recent performance and progress</p>
                </div>
                <Link to="/quizzes" className="w-full sm:w-auto text-center text-sm font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-6 py-3 rounded-xl transition uppercase tracking-widest border border-blue-100">Take More Quizzes</Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-5 rounded-2xl border border-red-100 flex items-center gap-3 font-bold shadow-sm">
                    <FaTimesCircle className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {attempts.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-xl shadow-blue-900/5">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <FaHistory className="text-gray-200 text-4xl" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No attempts yet</h3>
                    <p className="text-gray-500 mb-10 max-w-xs mx-auto font-medium">You haven't taken any quizzes yet. Start your learning journey today!</p>
                    <Link
                        to="/quizzes"
                        className="inline-block bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition transform active:scale-95"
                    >
                        Browse Quizzes
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {attempts.map((attempt) => (
                        <div
                            key={attempt._id}
                            className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-2xl hover:shadow-blue-900/5 transition duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center gap-6 w-full lg:w-auto">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                                    attempt.passed 
                                    ? 'bg-green-50/50 border-green-200 text-green-600 shadow-sm' 
                                    : 'bg-red-50/50 border-red-200 text-red-600 shadow-sm'
                                }`}>
                                    {attempt.passed ? <FaCheckCircle size={28} /> : <FaTimesCircle size={28} />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xl font-black text-gray-900 truncate group-hover:text-blue-600 transition leading-tight">
                                        {attempt.quiz?.title ? <MathText text={attempt.quiz.title} /> : 'Deleted Quiz'}
                                    </h4>
                                    <div className="flex items-center gap-5 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100"><FaCalendarAlt className="text-blue-500" /> {new Date(attempt.createdAt).toLocaleDateString()}</span>
                                        <span className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                                            attempt.passed ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                                        }`}>
                                            <FaAward /> {attempt.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-12 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-50">
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <span className="block text-3xl font-black text-gray-900 leading-none">{attempt.percentage}%</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 block">Success Rate</span>
                                </div>
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <span className="block text-xl font-black text-gray-700 leading-none">{attempt.score}/{attempt.totalQuestions}</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 block">Correct Answers</span>
                                </div>
                                <Link
                                    to={`/quizzes/${attempt.quiz?._id}`}
                                    className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-blue-600 shadow-lg shadow-gray-200 hover:shadow-blue-200 transition-all transform group-active:scale-95"
                                >
                                    <FaChevronRight size={18} />
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
