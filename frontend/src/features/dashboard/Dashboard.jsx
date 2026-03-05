import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaLayerGroup, FaUsers, FaPlus, FaChevronRight, FaClock } from 'react-icons/fa';
import useDashboardStore from '../../store/dashboardStore';
import useAuthStore from '../../store/authStore';

const Dashboard = () => {
    const { stats, distribution, activity, isLoading, fetchStats, fetchDistribution, fetchRecentActivity } = useDashboardStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchStats();
        fetchDistribution();
        fetchRecentActivity();
    }, [fetchStats, fetchDistribution, fetchRecentActivity]);

    if (isLoading && !stats) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h2>
                <p className="mt-2 text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span>. Here's what's happening in your question bank.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-50 rounded-xl p-3">
                            <FaQuestionCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Questions</dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-bold text-gray-900">{stats?.totalQuestions || 0}</div>
                                    {user?.role === 'Instructor' && (
                                        <div className="ml-2 text-xs text-gray-500">(Your: {stats?.myQuestions || 0})</div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-50 rounded-xl p-3">
                            <FaLayerGroup className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Quizzes</dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-bold text-gray-900">{stats?.totalQuizzes || 0}</div>
                                    {user?.role === 'Instructor' && (
                                        <div className="ml-2 text-xs text-gray-500">(Your: {stats?.myQuizzes || 0})</div>
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-50 rounded-xl p-3">
                            <FaUsers className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Platform Users</dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visualizations Placeholder */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        Question Distribution
                    </h3>
                    <div className="space-y-6">
                        {distribution?.types?.map((type) => (
                            <div key={type._id}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">{type._id}</span>
                                    <span className="text-sm font-bold text-gray-900">{type.count}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (type.count / (stats?.totalQuestions || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <Link to="/questions" className="text-xs font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wider">View All</Link>
                    </div>
                    <ul className="divide-y divide-gray-50">
                        {activity?.questions?.map((q) => (
                            <li key={q._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <FaPlus className="text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">New question added: <span className="font-bold underline">{q.title}</span></p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                            <FaClock />
                                            <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                                            <span>&bull;</span>
                                            <span>By {q.createdBy?.name}</span>
                                        </div>
                                    </div>
                                    <Link to={`/questions/${q._id}`} className="text-gray-400 hover:text-gray-600">
                                        <FaChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
