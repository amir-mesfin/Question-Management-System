import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaExclamationCircle, FaImage, FaSpinner } from 'react-icons/fa';
import useQuestionStore from '../../store/questionStore';

const QuestionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { createQuestion, updateQuestion, fetchQuestionById, question: editingQuestion, isLoading, uploadImage, isUploading } = useQuestionStore();

    const [formData, setFormData] = useState({
        title: '',
        type: 'MCQ',
        difficulty: 'Medium',
        category: '',
        tags: '',
        status: 'Published',
        correctAnswerText: '',
        explanation: '',
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false }
        ],
        mediaUrl: '',
    });

    useEffect(() => {
        const loadQuestion = async () => {
            if (isEditMode) {
                await fetchQuestionById(id);
            }
        };
        loadQuestion();
    }, [id, isEditMode, fetchQuestionById]);

    useEffect(() => {
        if (isEditMode && editingQuestion) {
            setFormData({
                title: editingQuestion.title || '',
                type: editingQuestion.type || 'MCQ',
                difficulty: editingQuestion.difficulty || 'Medium',
                category: editingQuestion.category || '',
                tags: editingQuestion.tags?.join(', ') || '',
                status: editingQuestion.status || 'Published',
                correctAnswerText: editingQuestion.correctAnswerText || '',
                explanation: editingQuestion.explanation || '',
                options: editingQuestion.options?.length > 0 ? editingQuestion.options : [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false }
                ],
                mediaUrl: editingQuestion.mediaUrl || '',
            });
        }
    }, [editingQuestion, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const url = await uploadImage(file);
            setFormData((prev) => ({ ...prev, mediaUrl: url }));
        } catch (err) {
            console.error('Image upload failed', err);
            alert('Failed to upload image. Please try again.');
        }
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];

        // If setting a new correct option for true/false or MCQ, uncheck others
        if (field === 'isCorrect' && value === true && (formData.type === 'MCQ' || formData.type === 'True/False')) {
            newOptions.forEach(opt => opt.isCorrect = false);
        }

        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        if (formData.options.length < 5) {
            setFormData({
                ...formData,
                options: [...formData.options, { text: '', isCorrect: false }]
            });
        }
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            const newOptions = formData.options.filter((_, i) => i !== index);
            // Ensure at least one is marked correct if we removed the correct one
            if (!newOptions.some(opt => opt.isCorrect)) {
                newOptions[0].isCorrect = true;
            }
            setFormData({ ...formData, options: newOptions });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Process tags from string to array
        const processedData = {
            ...formData,
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
        };

        // Clean up data based on type
        if (formData.type === 'Essay') {
            delete processedData.options;
            delete processedData.correctAnswerText;
        } else if (formData.type === 'Fill-in-the-Blank') {
            delete processedData.options;
        } else {
            delete processedData.correctAnswerText;
        }

        try {
            if (isEditMode) {
                await updateQuestion(id, processedData);
            } else {
                await createQuestion(processedData);
            }
            navigate('/questions');
        } catch (err) {
            console.error(err);
            // Error is handled in store
        }
    };

    if (isEditMode && isLoading && !editingQuestion) {
        return <div className="p-8 text-center text-gray-500">Loading question details...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Question' : 'Create New Question'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Fill out the details below to save to the question bank</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

                    {/* Basic Information Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question Title / Text <span className="text-red-500">*</span></label>
                            <textarea
                                name="title"
                                required
                                rows="3"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                                placeholder="What is the capital of France?"
                                value={formData.title}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type <span className="text-red-500">*</span></label>
                                <select
                                    name="type"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                    value={formData.type}
                                    onChange={handleChange}
                                    disabled={isEditMode} // Usually shouldn't change type after creation
                                >
                                    <option value="MCQ">Multiple Choice</option>
                                    <option value="True/False">True / False</option>
                                    <option value="Fill-in-the-Blank">Fill in the Blank</option>
                                    <option value="Essay">Essay</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty <span className="text-red-500">*</span></label>
                                <select
                                    name="difficulty"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category / Subject <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="category"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g., Mathematics, History"
                                    value={formData.category}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g., algebra, 101, final-exam"
                                    value={formData.tags}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="Draft">Draft (Hidden from students)</option>
                                    <option value="Published">Published (Visible)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Answer Configuration Section based on Type */}
                    <div className="space-y-6 bg-gray-50 -mx-6 sm:-mx-8 px-6 sm:px-8 py-6 border-y border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Answer Configuration</h3>

                        {(formData.type === 'MCQ' || formData.type === 'True/False') && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 mb-2">Configure options and select the correct answer.</p>
                                {formData.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={option.isCorrect}
                                                onChange={() => handleOptionChange(index, 'isCorrect', true)}
                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                                            />
                                        </div>
                                        {formData.type === 'True/False' ? (
                                            <input
                                                type="text"
                                                readOnly
                                                value={index === 0 ? 'True' : 'False'}
                                                className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md sm:text-sm text-gray-500 font-medium"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                required
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        )}

                                        {formData.type === 'MCQ' && formData.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="text-gray-400 hover:text-red-500 transition p-2"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {formData.type === 'MCQ' && formData.options.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition"
                                    >
                                        <FaPlus /> Add Option
                                    </button>
                                )}
                            </div>
                        )}

                        {formData.type === 'Fill-in-the-Blank' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Exact Correct Answer <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    name="correctAnswerText"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter the word or phrase that fills the blank"
                                    value={formData.correctAnswerText || ''}
                                    onChange={handleChange}
                                />
                                <p className="mt-2 text-xs text-gray-500">Grading will be case-insensitive but must otherwise match exactly.</p>
                            </div>
                        )}

                        {formData.type === 'Essay' && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                <div className="text-blue-500 mt-0.5"><FaExclamationCircle /></div>
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900">Manual Grading Required</h4>
                                    <p className="text-sm text-blue-700 mt-1">Essay questions do not have an automated correct answer and will require manual instructor review during quizzes.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Explanation (Optional)</label>
                        <textarea
                            name="explanation"
                            rows="3"
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                            placeholder="Provide a detailed explanation that students will see after answering."
                            value={formData.explanation}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Media Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Question Image (Optional)</label>
                        <div className="flex items-center gap-4">
                            {formData.mediaUrl && (
                                <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={formData.mediaUrl} alt="Question preview" className="object-cover h-full w-full" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, mediaUrl: '' }))}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 focus:outline-none"
                                    >
                                        <FaTrash size={10} />
                                    </button>
                                </div>
                            )}

                            {!formData.mediaUrl && (
                                <div className="flex items-center">
                                    <label className="flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        {isUploading ? <FaSpinner className="animate-spin mr-2" /> : <FaImage className="mr-2 text-gray-400" />}
                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                        <input
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/questions')}
                            className="px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
                        >
                            <FaSave />
                            {isLoading ? 'Saving...' : 'Save Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionForm;
