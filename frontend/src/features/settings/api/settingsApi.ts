import { api } from '@/lib/api';
import type { User } from '@/features/auth/types';

export const settingsApi = {
    updateProfile: async (data: {
        company_name?: string;
        address?: string;
        tax_id?: string;
        payment_info?: string;
    }): Promise<User> => {
        return api.put<User>('/api/v1/auth/me', data);
    },
};