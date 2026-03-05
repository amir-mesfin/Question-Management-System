import { create } from 'zustand';
import api from '../services/api';

const useDashboardStore = create((set) => ({
    stats: null,
    distribution: null,
    activity: null,
    isLoading: false,
    error: null,

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get('/dashboard/stats');
            set({ stats: data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch dashboard stats',
                isLoading: false,
            });
        }
    },

    fetchDistribution: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get('/dashboard/distribution');
            set({ distribution: data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch question distribution',
                isLoading: false,
            });
        }
    },

    fetchRecentActivity: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get('/dashboard/activity');
            set({ activity: data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch recent activity',
                isLoading: false,
            });
        }
    },
}));

export default useDashboardStore;
