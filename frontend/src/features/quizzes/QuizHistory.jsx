import React, { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaCheckCircle, FaTimesCircle, FaChevronRight, FaCalendarAlt, FaAward, FaBook } from 'react-icons/fa';
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
            const [attemptsRes, practiceRes] = await Promise.all([
                api.get('/attempts/my'),
                api.get('/practice-sessions/my'),
            ]);
            const quizItems = (attemptsRes.data || []).map((a) => ({ kind: 'quiz', ...a }));
            const practiceItems = (practiceRes.data || []).map((p) => ({ kind: 'practice', ...p }));
            const merged = [...quizItems, ...practiceItems].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setAttempts(merged);
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
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My History</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Quizzes and practice sessions, newest first</p>
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
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No activity yet</h3>
                    <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">Complete a practice session or submit a quiz to see it here.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/practice"
                            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform active:scale-95"
                        >
                            Practice
                        </Link>
                        <Link
                            to="/quizzes"
                            className="inline-block bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-blue-600 hover:shadow-blue-200 transition transform active:scale-95"
                        >
                            Quizzes
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {attempts.map((attempt) => {
                        const isPractice = attempt.kind === 'practice';
                        const continueTo = isPractice
                            ? `/practice/${attempt.subject?._id}`
                            : `/quizzes/${attempt.quiz?._id}`;
                        const canOpen = isPractice ? Boolean(attempt.subject?._id) : Boolean(attempt.quiz?._id);
                        return (
                        <div
                            key={`${attempt.kind}-${attempt._id}`}
                            className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-2xl hover:shadow-blue-900/5 transition duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center gap-6 w-full lg:w-auto">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                                    isPractice
                                    ? 'bg-blue-50/50 border-blue-200 text-blue-600 shadow-sm'
                                    : attempt.passed
                                    ? 'bg-green-50/50 border-green-200 text-green-600 shadow-sm'
                                    : 'bg-red-50/50 border-red-200 text-red-600 shadow-sm'
                                }`}>
                                    {isPractice ? <FaBook size={26} /> : attempt.passed ? <FaCheckCircle size={28} /> : <FaTimesCircle size={28} />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xl font-black text-gray-900 truncate group-hover:text-blue-600 transition leading-tight">
                                        {isPractice ? (
                                            attempt.subject?.name ? `Practice — ${attempt.subject.name}` : 'Practice'
                                        ) : attempt.quiz?.title ? (
                                            <MathText text={attempt.quiz.title} />
                                        ) : (
                                            'Deleted Quiz'
                                        )}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100"><FaCalendarAlt className="text-blue-500" /> {new Date(attempt.createdAt).toLocaleDateString()}</span>
                                        {isPractice ? (
                                            <span className="flex items-center gap-2 px-3 py-1 rounded-lg border bg-blue-50 border-blue-100 text-blue-600">
                                                <FaBook /> Practice
                                            </span>
                                        ) : (
                                            <span className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                                                attempt.passed ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                                            }`}>
                                                <FaAward /> {attempt.passed ? 'PASSED' : 'FAILED'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-12 w-full lg:w-auto border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-50">
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <span className="block text-3xl font-black text-gray-900 leading-none">{attempt.percentage}%</span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 block">Success Rate</span>
                                </div>
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <span className="block text-xl font-black text-gray-700 leading-none">
                                        {isPractice ? `${attempt.correctCount}/${attempt.totalAnswered}` : `${attempt.score}/${attempt.totalQuestions}`}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 block">Correct Answers</span>
                                </div>
                                {canOpen ? (
                                    <Link
                                        to={continueTo}
                                        className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-blue-600 shadow-lg shadow-gray-200 hover:shadow-blue-200 transition-all transform group-active:scale-95"
                                    >
                                        <FaChevronRight size={18} />
                                    </Link>
                                ) : (
                                    <span className="p-4 bg-gray-100 text-gray-400 rounded-2xl cursor-not-allowed" title="Unavailable">
                                        <FaChevronRight size={18} />
                                    </span>
                                )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default QuizHistory;
