import { create } from 'zustand';
import api from '../services/api';

const useSubjectStore = create((set, get) => ({
    subjects: [],
    isLoading: false,
    error: null,

    fetchSubjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get('/subjects');
            set({ subjects: data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch subjects',
                isLoading: false,
            });
        }
    },

    createSubject: async (subjectData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/subjects', subjectData);
            set((state) => ({
                subjects: [...state.subjects, { ...data, questionCount: 0 }],
                isLoading: false
            }));
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to create subject',
                isLoading: false,
            });
            throw error;
        }
    },

    updateSubject: async (id, subjectData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.put(`/subjects/${id}`, subjectData);
            set((state) => ({
                subjects: state.subjects.map((s) => (s._id === id ? { ...s, ...data } : s)),
                isLoading: false,
            }));
            return data;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to update subject',
                isLoading: false,
            });
            throw error;
        }
    },

    deleteSubject: async (id, actionData) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/subjects/${id}`, { data: actionData });
            await get().fetchSubjects(); 
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to delete subject',
                isLoading: false,
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useSubjectStore;
