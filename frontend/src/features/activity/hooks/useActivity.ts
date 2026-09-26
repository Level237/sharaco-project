// features/activity/hooks/useActivity.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ActivityItem {
    id: string;
    type: 'PROJECT' | 'DOCUMENT';
    action: 'CREATED' | 'UPDATED' | 'SENT' | 'ACCEPTED' | 'REFUSED' | 'VIEWED';
    title: string;
    subtitle?: string;
    icon: string;
    color: string;
    link?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export function useActivity(params?: {
    limit?: number;
    type_filter?: 'PROJECT' | 'DOCUMENT';
    action_filter?: string;
}) {
    return useQuery({
        queryKey: ['activity', params],
        queryFn: () => {
            const query = new URLSearchParams();
            if (params?.limit) query.set('limit', params.limit.toString());
            if (params?.type_filter) query.set('type_filter', params.type_filter);
            if (params?.action_filter) query.set('action_filter', params.action_filter);

            const queryString = query.toString();
            return api.get<ActivityItem[]>(
                `/api/v1/activity${queryString ? `?${queryString}` : ''}`
            );
        },
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchInterval: 30 * 1000, // Refresh toutes les 30 secondes
    });
}