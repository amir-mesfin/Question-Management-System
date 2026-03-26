import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import useQuestionStore from '../../store/questionStore';
import useAuthStore from '../../store/authStore';
import MathText from '../../components/MathText';

const QuestionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchQuestionById, question, isLoading, error } = useQuestionStore();
    const { user } = useAuthStore();

    const canManage = user?.role === 'Admin' || user?.role === 'Instructor';

    useEffect(() => {
        if (id) {
            fetchQuestionById(id);
        }
    }, [id, fetchQuestionById]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center gap-4 max-w-lg mx-auto mt-12">
                <FaExclamationCircle size={48} />
                <h3 className="text-xl font-bold">Error Loading Question</h3>
                <p className="text-center">{error}</p>
                <button onClick={() => navigate('/questions')} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition">Back to Questions</button>
            </div>
        );
    }

    if (!question) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/questions')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-gray-50 group-hover:border-gray-300 transition-all">
                        <FaArrowLeft size={12} />
                    </div>
                    <span>Back to Bank</span>
                </button>

                {canManage && (
                    <button
                        onClick={() => navigate(`/questions/${question._id}/edit`)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-95"
                    >
                        <FaEdit />
                        <span>Edit Question</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12 space-y-8">
                    {/* Metadata Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                question.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border border-green-200' :
                                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                                {question.difficulty}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                {question.subject?.name || 'Uncategorized'}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                {question.type}
                            </span>
                        </div>
                        
                        <div className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                            <MathText text={question.title} />
                        </div>
                    </div>

                    {/* Media Display */}
                    {question.mediaUrl && (
                        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                            <img src={question.mediaUrl} alt="Question Context" className="w-full object-contain max-h-[500px]" />
                        </div>
                    )}

                    {/* Options / Answer Section */}
                    {(question.type === 'MCQ' || question.type === 'True/False') ? (
                        <div className="grid grid-cols-1 gap-4">
                            {question.options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className={`relative p-6 rounded-3xl border-2 transition-all ${
                                        option.isCorrect 
                                        ? 'bg-green-50/50 border-green-500/30' 
                                        : 'bg-white border-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                                            option.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className="flex-1 text-lg font-bold text-gray-800">
                                            <MathText text={option.text} />
                                        </div>
                                        {option.isCorrect && (
                                            <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <FaCheckCircle />
                                                Correct
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 bg-blue-50/20 rounded-[2rem] border-2 border-dashed border-blue-100 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                                <FaCheckCircle size={24} />
                            </div>
                            <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest">Answer Information</h4>
                            <div className="text-xl font-bold text-gray-900 leading-relaxed max-w-lg">
                                {question.type === 'Essay' 
                                    ? "This is an essay question. Students will provide a written response." 
                                    : (
                                        <div className="space-y-2">
                                            <span className="text-sm text-gray-400 block uppercase tracking-widest font-black">Correct Answer Text</span>
                                            <div className="bg-white px-6 py-3 rounded-2xl border border-blue-100 inline-block shadow-sm">
                                                <MathText text={question.correctAnswerText || "Not specified"} />
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )}

                    {/* Explanation Section */}
                    {question.explanation && (
                        <div className="pt-8 border-t border-gray-100">
                            <div className="bg-gray-900 text-white p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <FaExclamationCircle size={80} />
                                </div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Expert Explanation</h4>
                                    </div>
                                    <div className="text-lg font-medium leading-relaxed text-gray-300 italic pr-8">
                                        <MathText text={question.explanation} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex justify-center flex-wrap gap-4 pt-4">
                {question.tags?.map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-500 shadow-sm hover:border-blue-400 transition-colors">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default QuestionDetail;
