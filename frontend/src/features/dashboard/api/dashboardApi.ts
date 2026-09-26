import { api } from '@/lib/api';
import { DashboardStats, MonthlyRevenue } from '../types';


export const dashboardApi = {
    getStats: async (): Promise<DashboardStats> => {
        return api.get<DashboardStats>('/api/v1/dashboard/stats');
    },

    getRevenue: async (months: number = 6): Promise<MonthlyRevenue[]> => {
        return api.get<MonthlyRevenue[]>(`/api/v1/dashboard/revenue?months=${months}`);
    },
};