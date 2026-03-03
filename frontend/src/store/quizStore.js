import { create } from 'zustand';
import api from '../services/api';

const useQuizStore = create((set, get) => ({
    quizzes: [],
    quiz: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 1,
        total: 0,
    },

    fetchQuizzes: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const { keyword, isPublished, page = 1 } = filters;
            let queryParams = `?page=${page}`;
            if (keyword) queryParams += `&keyword=${keyword}`;
            if (isPublished !== undefined) queryParams += `&isPublished=${isPublished}`;

            const { data } = await api.get(`/quizzes${queryParams}`);

            set({
                quizzes: data.quizzes,
                pagination: {
                    page: data.page,
                    pages: data.pages,
                    total: data.total
                },
                isLoading: false
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch quizzes',
                isLoading: false,
            });
        }
    },

    fetchQuizById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get(`/quizzes/${id}`);
            set({ quiz: data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch quiz details',
                isLoading: false,
            });
        }
    },

    createQuiz: async (quizData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/quizzes', quizData);
            set((state) => ({
                quizzes: [data, ...state.quizzes],
                isLoading: false
            }));
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create quiz',
                isLoading: false,
            });
            throw error;
        }
    },

    updateQuiz: async (id, quizData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.put(`/quizzes/${id}`, quizData);
            set((state) => ({
                quizzes: state.quizzes.map((q) => (q._id === id ? data : q)),
                quiz: state.quiz?._id === id ? data : state.quiz,
                isLoading: false,
            }));
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update quiz',
                isLoading: false,
            });
            throw error;
        }
    },

    deleteQuiz: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/quizzes/${id}`);
            set((state) => ({
                quizzes: state.quizzes.filter((q) => q._id !== id),
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete quiz',
                isLoading: false,
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useQuizStore;
