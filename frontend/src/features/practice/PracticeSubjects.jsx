import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSubjectStore from '../../store/subjectStore';
import useAuthStore from '../../store/authStore';
import { FaBook, FaExclamationCircle } from 'react-icons/fa';

const PracticeSubjects = () => {
    const { subjects, isLoading, error, fetchSubjects } = useSubjectStore();
    const { user } = useAuthStore();

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    // Show only subjects that have questions
    const accessibleSubjects = subjects.filter(sub => sub.questionCount > 0);

    return (
        <div className="space-y-6 animate-fadeIn py-6 px-4 sm:px-0">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Practice by Subject</h2>
                <p className="text-lg text-gray-500">Pick a topic and start answering questions sequentially to master the material.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center gap-3 max-w-md mx-auto">
                    <FaExclamationCircle /> <p>{error}</p>
                </div>
            )}

            {isLoading && subjects.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : accessibleSubjects.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
                    <FaBook className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No subjects available yet</h3>
                    <p className="text-gray-500">Check back later when instructors add more practice questions.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {accessibleSubjects.map((subject) => (
                        <Link 
                            key={subject._id} 
                            to={`/practice/${subject._id}`}
                            className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
                        >
                            <div className="flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <FaBook size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{subject.name}</h3>
                                {subject.description && (
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">{subject.description}</p>
                                )}
                            </div>
                            
                            <div className="border-t border-gray-50 pt-4 mt-auto flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 text-gray-600 text-[11px] font-black uppercase tracking-wider">
                                    {subject.questionCount} {subject.questionCount === 1 ? 'Question' : 'Questions'}
                                </span>
                                <span className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    Start &rarr;
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PracticeSubjects;
