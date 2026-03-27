import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaTimesCircle, FaCheckCircle, FaCheck, FaRedo, FaList } from 'react-icons/fa';
import useQuestionStore from '../../store/questionStore';
import useSubjectStore from '../../store/subjectStore';
import MathText from '../../components/MathText';

const PracticePlayer = () => {
    const { subjectId } = useParams();
    
    const { questions, isLoading, error, fetchQuestions } = useQuestionStore();
    const { subjects, fetchSubjects } = useSubjectStore();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [checkedResult, setCheckedResult] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

    const subject = subjects.find(s => s._id === subjectId) || { name: 'Practice Mode' };

    useEffect(() => {
        fetchQuestions({ subject: subjectId, limit: 100 });
        if (subjects.length === 0) {
            fetchSubjects();
        }
    }, [subjectId, fetchQuestions, fetchSubjects, subjects.length]);

    useEffect(() => {
        setCurrentAnswer('');
        setCheckedResult(null);
    }, [currentQuestionIndex]);

    const handleAnswerChange = (answerText) => {
        if (!checkedResult) {
            setCurrentAnswer(answerText);
        }
    };

    const handleCheckAnswer = () => {
        if (!currentAnswer) return;

        const currentQuestion = questions[currentQuestionIndex];
        let isCorrect = false;
        let correctAnswerText = currentQuestion.correctAnswerText || '';

        if (currentQuestion.type === 'MCQ' || currentQuestion.type === 'True/False') {
            const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
            if (correctOption) {
                correctAnswerText = correctOption.text;
                isCorrect = currentAnswer === correctOption.text;
            }
        } else {
            if (currentQuestion.correctAnswerText) {
                isCorrect = currentAnswer.trim().toLowerCase() === currentQuestion.correctAnswerText.trim().toLowerCase();
            }
        }

        setCheckedResult({
            isCorrect,
            correctAnswerText,
            explanation: currentQuestion.explanation
        });

        if (isCorrect) {
            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        }
    };

    const handleNext = () => {
        const nextTotal = sessionStats.total + 1;
        const isLast = currentQuestionIndex >= questions.length - 1;

        setSessionStats((prev) => ({ ...prev, total: prev.total + 1 }));

        if (isLast) {
            setIsFinished(true);
            if (subjectId && nextTotal >= 1) {
                api.post('/practice-sessions', {
                    subjectId,
                    correctCount: sessionStats.correct,
                    totalAnswered: nextTotal,
                }).catch(() => {});
            }
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

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
                <FaTimesCircle size={48} />
                <h3 className="text-xl font-bold">Oops! Could not load questions</h3>
                <p className="text-center">{error}</p>
                <Link to="/practice" className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition">Back to Subjects</Link>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-2">No questions available</h3>
                <p className="text-gray-500 mb-6">There are no questions available for practice in this subject yet.</p>
                <Link to="/practice" className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-2 rounded-xl font-bold transition">Browse Other Subjects</Link>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="max-w-2xl mx-auto mt-12 space-y-8 animate-fadeIn text-center">
                <div className="p-12 bg-white rounded-[3rem] shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
                    <FaCheckCircle className="mx-auto h-24 w-24 text-green-500 mb-6" />
                    <h2 className="text-4xl font-black text-gray-900 mb-4">Practice Completed!</h2>
                    <p className="text-lg text-gray-600 mb-8">You have answered all available questions in <strong className="text-blue-600">{subject.name}</strong>.</p>
                    
                    <div className="flex justify-center gap-8 mb-10">
                        <div>
                            <span className="block text-4xl font-black text-gray-900">{sessionStats.correct}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Correct</span>
                        </div>
                        <div className="w-px bg-gray-200"></div>
                        <div>
                            <span className="block text-4xl font-black text-gray-900">{sessionStats.total}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Attempted</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => { setCurrentQuestionIndex(0); setIsFinished(false); setSessionStats({ correct: 0, total: 0 }); }} className="flex justify-center items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                            <FaRedo /> Practice Again
                        </button>
                        <Link to="/practice" className="flex justify-center items-center gap-2 px-8 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 active:scale-95 transition-all">
                            <FaList /> More Subjects
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn mt-6">
            <div className="flex justify-between items-center px-2 mb-8">
                <div>
                    <Link to="/practice" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition mb-2">
                        <FaChevronLeft size={12} /> Back to Subjects
                    </Link>
                    <h2 className="text-2xl font-black text-gray-900">{subject.name}</h2>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Progress</span>
                    <div className="text-lg font-bold text-blue-600">{currentQuestionIndex + 1} / {questions.length}</div>
                </div>
            </div>

            <div className="w-full bg-blue-50/50 rounded-full h-2 overflow-hidden mb-6">
                <div className="bg-blue-600 h-full transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                {currentQuestion.type}
                            </span>
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                currentQuestion.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' :
                                currentQuestion.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {currentQuestion.difficulty}
                            </span>
                        </div>
                        
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                            <MathText text={currentQuestion.title || ""} />
                        </div>
                    </div>

                    {currentQuestion.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                            <img src={currentQuestion.mediaUrl} alt="Question Media" className="w-full object-cover max-h-[400px]" />
                        </div>
                    )}

                    {(currentQuestion.type === 'MCQ' || currentQuestion.type === 'True/False') ? (
                        <div className="grid grid-cols-1 gap-4">
                            {currentQuestion.options.map((option, idx) => {
                                let btnClasses = "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30";
                                let dotClasses = "border-gray-200 group-hover:border-blue-400";
                                let textClasses = "text-gray-700";

                                if (currentAnswer === option.text) {
                                    btnClasses = "bg-blue-50 border-blue-600 shadow-sm";
                                    dotClasses = "border-blue-600 bg-blue-600";
                                    textClasses = "text-blue-900";
                                }

                                if (checkedResult) {
                                    if (option.text === checkedResult.correctAnswerText) {
                                        if (currentAnswer === option.text) {
                                            btnClasses = "bg-green-50 border-green-500 shadow-sm";
                                        } else {
                                            btnClasses = "bg-white border-green-500 shadow-sm outline outline-2 outline-green-100";
                                        }
                                        dotClasses = "border-green-500 bg-green-500";
                                        textClasses = "text-green-900";
                                    } else if (currentAnswer === option.text && !checkedResult.isCorrect) {
                                        btnClasses = "bg-red-50 border-red-500 shadow-sm opacity-50";
                                        dotClasses = "border-red-500 bg-red-500";
                                        textClasses = "text-red-900 line-through";
                                    } else {
                                        btnClasses += " opacity-40 cursor-not-allowed";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerChange(option.text)}
                                        disabled={checkedResult !== null}
                                        className={`group w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${btnClasses}`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${dotClasses}`}>
                                                <div className={`w-2 h-2 rounded-full bg-white transition-transform duration-300 ${
                                                    currentAnswer === option.text || (checkedResult && option.text === checkedResult.correctAnswerText) ? 'scale-100' : 'scale-0'
                                                }`} />
                                            </div>
                                            <div className={`flex-1 text-lg font-bold transition-colors ${textClasses}`}>
                                                <MathText text={option.text} />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest px-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Type your answer
                            </h4>
                            <textarea
                                className={`w-full p-6 border-2 rounded-2xl text-xl font-bold bg-gray-50/50 min-h-[150px] transition-all focus:ring-0 ${
                                    checkedResult ? (checkedResult.isCorrect ? 'border-green-500 text-green-900 bg-green-50' : 'border-red-500 text-red-900 bg-red-50') : 'border-gray-200 focus:border-blue-500 text-gray-900'
                                }`}
                                placeholder="Type answer here..."
                                value={currentAnswer}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                disabled={checkedResult !== null || currentQuestion.type === 'Essay'}
                            ></textarea>
                            {currentQuestion.type === 'Essay' && (
                                <p className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl">Note: Essay questions cannot be automatically checked in Practice mode.</p>
                            )}
                        </div>
                    )}

                    {checkedResult && (
                        <div className={`mt-8 p-6 rounded-2xl border-2 animate-fadeIn ${
                            checkedResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                            <div className="flex items-center gap-3 mb-2">
                                {checkedResult.isCorrect ? <FaCheckCircle className="text-2xl text-green-500" /> : <FaTimesCircle className="text-2xl text-red-500" />}
                                <h4 className={`text-xl font-black ${checkedResult.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                    {checkedResult.isCorrect ? 'Excellent!' : 'Incorrect'}
                                </h4>
                            </div>
                            
                            {!checkedResult.isCorrect && currentQuestion.type !== 'MCQ' && currentQuestion.type !== 'True/False' && (
                                <div className="mt-4 bg-white/60 p-4 rounded-xl border border-red-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block mb-1">Expected Answer</span>
                                    <div className="text-gray-900 font-bold text-lg"><MathText text={checkedResult.correctAnswerText} /></div>
                                </div>
                            )}

                            {checkedResult.explanation && (
                                <div className="mt-4 bg-white/60 p-5 rounded-xl border border-gray-100/50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block mb-2">Explanation</span>
                                    <div className="text-gray-700 text-sm italic leading-relaxed"><MathText text={currentQuestion.explanation} /></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 sm:px-12 sm:py-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm font-bold text-gray-400">
                        {checkedResult ? 'Ready for the next one?' : 'Select your answer and check it.'}
                    </p>
                    <div className="w-full sm:w-auto">
                        {!checkedResult ? (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={!currentAnswer || currentQuestion.type === 'Essay'}
                                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-gray-200 hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
                            >
                                <FaCheck /> Check Answer
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all animate-bounce"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'} <FaChevronRight />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticePlayer;
