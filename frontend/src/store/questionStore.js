import { create } from 'zustand';
import api from '../services/api';

const useQuestionStore = create((set, get) => ({
    questions: [],
    question: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0,
    },

    // Fetch all questions with optional filters
    fetchQuestions: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const { keyword, category, difficulty, status, page = 1 } = filters;
            let queryParams = `?page=${page}`;
            if (keyword) queryParams += `&keyword=${keyword}`;
            if (category) queryParams += `&category=${category}`;
            if (difficulty) queryParams += `&difficulty=${difficulty}`;
            if (status) queryParams += `&status=${status}`;

            const { data } = await api.get(`/questions${queryParams}`);

            set({
                questions: data.questions,
                pagination: {
                    page: data.page,
                    pages: data.pages,
                    total: data.total
                },
                isLoading: false
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch questions',
                isLoading: false,
            });
        }
    },

    fetchQuestionById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get(`/questions/${id}`);
            set({ question: data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch question details',
                isLoading: false,
            });
        }
    },

    createQuestion: async (questionData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/questions', questionData);
            set((state) => ({
                questions: [data, ...state.questions],
                isLoading: false
            }));
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create question',
                isLoading: false,
            });
            throw error;
        }
    },

    updateQuestion: async (id, questionData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.put(`/questions/${id}`, questionData);
            set((state) => ({
                questions: state.questions.map((q) => (q._id === id ? data : q)),
                question: state.question?._id === id ? data : state.question,
                isLoading: false,
            }));
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update question',
                isLoading: false,
            });
            throw error;
        }
    },

    deleteQuestion: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/questions/${id}`);
            set((state) => ({
                questions: state.questions.filter((q) => q._id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete question',
                isLoading: false,
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useQuestionStore;
