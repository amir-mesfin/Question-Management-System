import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChartBar, FaUser, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaSearch } from 'react-icons/fa';
import api from '../../services/api';

const QuizStats = () => {
    const { id } = useParams();
    const [attempts, setAttempts] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [attemptsRes, quizRes] = await Promise.all([
                api.get(`/api/attempts/quiz/${id}`),
                api.get(`/api/quizzes/${id}`)
            ]);
            setAttempts(attemptsRes.data);
            setQuiz(quizRes.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredAttempts = attempts.filter(attempt =>
        attempt.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && !quiz) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/quizzes" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition">
                        <FaChevronLeft />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{quiz?.title || 'Quiz Stats'}</h2>
                        <p className="text-sm text-gray-500 mt-0.5 font-medium tracking-tight uppercase tracking-widest text-[10px]">Student Performance Overview</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                    <FaTimesCircle /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Total Attempts</span>
                    <span className="text-3xl font-black text-gray-900">{attempts.length}</span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Pass Rate</span>
                    <span className="text-3xl font-black text-green-600">
                        {attempts.length > 0
                            ? `${Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)}%`
                            : '0%'}
                    </span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Avg. Score</span>
                    <span className="text-3xl font-black text-blue-600">
                        {attempts.length > 0
                            ? `${Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length)}%`
                            : '0%'}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
                    <FaSearch className="text-gray-400 ml-2" />
                    <input
                        type="text"
                        placeholder="Search student..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttempts.map((attempt) => (
                                <tr key={attempt._id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FaUser size={12} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{attempt.user?.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{attempt.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                        {new Date(attempt.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 text-sm">{attempt.percentage}%</span>
                                        <span className="text-[10px] text-gray-400 ml-1">({attempt.score}/{attempt.totalQuestions})</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {attempt.passed ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-wider border border-green-100">
                                                <FaCheckCircle /> Passed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-100">
                                                <FaTimesCircle /> Failed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredAttempts.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm font-medium italic">
                                        No attempts found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QuizStats;
