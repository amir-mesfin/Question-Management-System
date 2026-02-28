import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                set({ user: response.data, isLoading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false,
            });
            throw error;
        }
    },

    register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                role,
            });
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                set({ user: response.data, isLoading: false });
            }
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false,
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null });
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
