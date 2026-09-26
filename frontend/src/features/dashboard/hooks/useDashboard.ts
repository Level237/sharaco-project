'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboardStats'],
        queryFn: () => dashboardApi.getStats(),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useDashboardRevenue(months: number = 6) {
    return useQuery({
        queryKey: ['dashboardRevenue', months],
        queryFn: () => dashboardApi.getRevenue(months),
        staleTime: 2 * 60 * 1000,
    });
}
