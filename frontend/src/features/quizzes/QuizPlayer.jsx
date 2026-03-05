import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle, FaClock, FaRedo, FaHome } from 'react-icons/fa';
import useQuizStore from '../../store/quizStore';

const QuizPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { quiz, isLoading, error, fetchQuizById, submitQuiz } = useQuizStore();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isFinished, setIsFinished] = useState(false);
    const [results, setResults] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetchQuizById(id);
    }, [id, fetchQuizById]);

    useEffect(() => {
        if (quiz && quiz.timeLimit > 0 && timeLeft === null) {
            setTimeLeft(quiz.timeLimit * 60);
        }
    }, [quiz, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0) {
            handleFinish();
        }
        if (timeLeft > 0 && !isFinished) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isFinished]);

    const handleAnswerChange = (answerText) => {
        const newAnswers = [...answers];
        const existingIndex = newAnswers.findIndex(a => a.questionId === quiz.questions[currentQuestionIndex]._id);

        if (existingIndex > -1) {
            newAnswers[existingIndex].answerText = answerText;
        } else {
            newAnswers.push({
                questionId: quiz.questions[currentQuestionIndex]._id,
                answerText
            });
        }
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleFinish = async () => {
        const res = await submitQuiz(id, answers);
        setResults(res);
        setIsFinished(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (isLoading && !quiz) {
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
                <h3 className="text-xl font-bold">Oops! Something went wrong</h3>
                <p className="text-center">{error}</p>
                <Link to="/quizzes" className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition">Back to Quizzes</Link>
            </div>
        );
    }

    if (!quiz) return null;

    if (isFinished && results) {
        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-12">
                <div className={`p-8 rounded-3xl border shadow-xl text-center ${results.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    {results.passed ? (
                        <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    ) : (
                        <FaTimesCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                    )}
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {results.passed ? 'Congratulations! You Passed!' : 'Better Luck Next Time!'}
                    </h2>
                    <p className="text-gray-500 mt-2">You scored <span className="text-2xl font-black text-gray-900">{results.percentage}%</span></p>
                    <div className="mt-6 flex justify-center gap-8">
                        <div>
                            <span className="block text-2xl font-bold text-gray-900">{results.score}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Correct</span>
                        </div>
                        <div className="w-px bg-gray-200"></div>
                        <div>
                            <span className="block text-2xl font-bold text-gray-900">{results.totalQuestions}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-900">Review Results</h3>
                    </div>
                    <ul className="divide-y divide-gray-50">
                        {results.results.map((res, idx) => (
                            <li key={idx} className="p-6">
                                <p className="font-bold text-gray-900 mb-3">{idx + 1}. {res.title}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className={`p-3 rounded-xl border ${res.isCorrect ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                        <span className="block font-bold mb-1 opacity-60">Your Answer:</span>
                                        {res.userAnswer || <span className="italic">No answer provided</span>}
                                    </div>
                                    {!res.isCorrect && (
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800">
                                            <span className="block font-bold mb-1 opacity-60">Correct Answer:</span>
                                            {res.correctAnswer}
                                        </div>
                                    )}
                                </div>
                                {res.explanation && (
                                    <div className="mt-4 text-sm text-gray-500 italic bg-blue-50/30 p-3 rounded-lg border border-blue-100/30">
                                        <span className="font-bold mr-2 text-blue-600 NOT-ITALIC">Explanation:</span>
                                        {res.explanation}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition transform active:scale-95">
                        <FaRedo /> Try Again
                    </button>
                    <Link to="/" className="flex items-center gap-2 px-8 py-3 bg-white text-gray-700 border border-gray-200 font-bold rounded-2xl shadow-sm hover:bg-gray-50 transition transform active:scale-95">
                        <FaHome /> Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion?._id)?.answerText || '';

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                </div>
                {timeLeft !== null && (
                    <div className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-lg ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
                        <FaClock />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-blue-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                ></div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">{currentQuestion?.title}</h3>

                    {currentQuestion?.mediaUrl && (
                        <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100">
                            <img src={currentQuestion.mediaUrl} alt="Question Media" className="w-full object-cover max-h-80" />
                        </div>
                    )}

                    {currentQuestion?.type === 'Multiple Choice' ? (
                        <div className="grid grid-cols-1 gap-4">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerChange(option)}
                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-bold ${currentAnswer === option
                                            ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md shadow-blue-50 scale-[1.02]'
                                            : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50 active:scale-98'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${currentAnswer === option ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        {option}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Type your answer below</label>
                            <textarea
                                className="w-full p-6 border-2 border-gray-100 rounded-3xl focus:border-blue-500 focus:ring-0 text-gray-900 font-medium bg-gray-50/50 min-h-[160px] transition-all"
                                placeholder="Your answer..."
                                value={currentAnswer}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                            ></textarea>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:text-gray-900 disabled:opacity-0 transition"
                    >
                        <FaChevronLeft /> Previous
                    </button>

                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleFinish}
                            className="bg-gray-900 text-white px-12 py-3 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
                        >
                            Finish Quiz
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-8 py-3 rounded-2xl font-bold shadow-sm hover:bg-blue-50 active:scale-95 transition-all"
                        >
                            Next <FaChevronRight />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPlayer;
