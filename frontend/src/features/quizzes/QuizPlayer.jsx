import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaTimesCircle, FaClock, FaRedo, FaHome } from 'react-icons/fa';
import useQuizStore from '../../store/quizStore';
import MathText from '../../components/MathText';

const QuizPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { quiz, isLoading, error, fetchQuizById, submitQuiz } = useQuizStore();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [checkedQuestions, setCheckedQuestions] = useState({});
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

    const handleCheckAnswer = () => {
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const currentAnswer = answers.find(a => a.questionId === currentQuestion._id)?.answerText;
        if (!currentAnswer) return;

        let isCorrect = false;
        let correctAnswerText = currentQuestion.correctAnswerText || '';

        if (currentQuestion.type === 'MCQ' || currentQuestion.type === 'True/False') {
            const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
            if (correctOption) {
                correctAnswerText = correctOption.text;
                isCorrect = currentAnswer === correctOption.text;
            }
        } else {
            if (currentAnswer && currentQuestion.correctAnswerText) {
                isCorrect = currentAnswer.trim().toLowerCase() === currentQuestion.correctAnswerText.trim().toLowerCase();
            }
        }

        setCheckedQuestions(prev => ({
            ...prev,
            [currentQuestion._id]: {
                isCorrect,
                correctAnswerText
            }
        }));
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
                            <li key={idx} className="p-8 space-y-4">
                                <div className="flex gap-4">
                                    <span className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-black text-gray-500">{idx + 1}</span>
                                    <div className="text-xl font-bold text-gray-900 leading-tight">
                                        <MathText text={res.title} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={`p-5 rounded-2xl border-2 ${res.isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {res.isCorrect ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${res.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                Your Answer
                                            </span>
                                        </div>
                                        <div className="text-gray-900 font-bold">
                                            {res.userAnswer ? <MathText text={res.userAnswer} /> : <span className="italic text-gray-400">No answer provided</span>}
                                        </div>
                                    </div>

                                    {!res.isCorrect && (
                                        <div className="p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                                    Correct Answer
                                                </span>
                                            </div>
                                            <div className="text-gray-900 font-bold">
                                                <MathText text={res.correctAnswer} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {res.explanation && (
                                    <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Expert Explanation</span>
                                        <div className="text-gray-700 text-sm leading-relaxed italic">
                                            <MathText text={res.explanation} />
                                        </div>
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
                <div className="p-8 sm:p-12 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                currentQuestion?.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border border-green-200' :
                                currentQuestion?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                                {currentQuestion?.difficulty}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                {currentQuestion?.category}
                            </span>
                        </div>
                        
                        <div className="text-3xl font-black text-gray-900 leading-tight">
                            <MathText text={currentQuestion?.title || ""} />
                        </div>
                    </div>

                    {currentQuestion?.mediaUrl && (
                        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-inner">
                            <img src={currentQuestion.mediaUrl} alt="Question Media" className="w-full object-cover max-h-[400px]" />
                        </div>
                    )}

                    {(currentQuestion?.type === 'MCQ' || currentQuestion?.type === 'Multiple Choice' || currentQuestion?.type === 'True/False') ? (
                        <div className="grid grid-cols-1 gap-4">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerChange(option.text)}
                                    className={`group w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${currentAnswer === option.text
                                            ? 'bg-blue-50/50 border-blue-600 shadow-lg shadow-blue-50 scale-[1.01]'
                                            : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50/50 active:scale-[0.99]'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                            currentAnswer === option.text ? 'border-blue-600 bg-blue-600' : 'border-gray-200 group-hover:border-blue-400'
                                        }`}>
                                            <div className={`w-2 h-2 rounded-full bg-white transition-transform duration-300 ${
                                                currentAnswer === option.text ? 'scale-100' : 'scale-0'
                                            }`} />
                                        </div>
                                        <div className={`flex-1 text-lg font-bold transition-colors ${
                                            currentAnswer === option.text ? 'text-blue-900' : 'text-gray-700'
                                        }`}>
                                            <MathText text={option.text} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest px-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {currentQuestion?.type === 'Essay' ? 'Write your essay below' : 'Type your answer below'}
                            </h4>
                            <textarea
                                className="w-full p-8 border-2 border-gray-100 rounded-[2rem] focus:border-blue-500 focus:ring-0 text-xl text-gray-900 font-bold bg-gray-50/30 min-h-[250px] transition-all placeholder:text-gray-200"
                                placeholder={currentQuestion?.type === 'Essay' ? "Start typing your response here..." : "Type the missing word or phrase..."}
                                value={currentAnswer}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                            ></textarea>
                            {currentQuestion?.type === 'Essay' && (
                                <p className="text-xs text-gray-400 font-bold px-2 italic text-center">Your essay will be saved automatically as you type.</p>
                            )}
                        </div>
                    )}
                    {checkedQuestions[currentQuestion?._id] && (
                        <div className={`mt-8 p-6 rounded-2xl border-2 ${checkedQuestions[currentQuestion._id].isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                {checkedQuestions[currentQuestion._id].isCorrect ? (
                                    <FaCheckCircle className="text-2xl text-green-500" />
                                ) : (
                                    <FaTimesCircle className="text-2xl text-red-500" />
                                )}
                                <h4 className={`text-xl font-bold ${checkedQuestions[currentQuestion._id].isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                    {checkedQuestions[currentQuestion._id].isCorrect ? 'Correct!' : 'Incorrect'}
                                </h4>
                            </div>
                            {!checkedQuestions[currentQuestion._id].isCorrect && (
                                <div className="mt-4">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Correct Answer:</span>
                                    <div className="text-gray-900 font-bold mt-1 text-lg">
                                        <MathText text={checkedQuestions[currentQuestion._id].correctAnswerText} />
                                    </div>
                                </div>
                            )}
                            {currentQuestion?.explanation && (
                                <div className="mt-4 p-4 bg-white/60 rounded-xl text-sm text-gray-700 italic border border-gray-100/50">
                                    <MathText text={currentQuestion.explanation} />
                                </div>
                            )}
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

                    <div className="flex flex-wrap justify-end gap-3">
                        {!checkedQuestions[currentQuestion?._id] && currentQuestion?.type !== 'Essay' && (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={!currentAnswer}
                                className="bg-blue-100 text-blue-700 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-blue-200 active:scale-95 transition-all disabled:opacity-50"
                            >
                                Check Answer
                            </button>
                        )}
                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleFinish}
                                className="bg-gray-900 text-white px-8 sm:px-12 py-3 rounded-2xl font-black text-lg shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
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
        </div>
    );
};

export default QuizPlayer;
