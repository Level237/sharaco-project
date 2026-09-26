import { api } from '@/lib/api';
import type { ReminderConfig, ReminderConfigUpdate, ReminderLog } from '../types';

export const remindersApi = {
    getConfig: async (): Promise<ReminderConfig> => {
        return api.get<ReminderConfig>('/api/v1/reminders/config');
    },

    updateConfig: async (data: ReminderConfigUpdate): Promise<ReminderConfig> => {
        return api.put<ReminderConfig>('/api/v1/reminders/config', data);
    },

    sendDocument: async (documentId: string): Promise<void> => {
        return api.post<void>(`/api/v1/reminders/send/${documentId}`);
    },

    sendReminder: async (documentId: string, level: number): Promise<void> => {
        return api.post<void>(`/api/v1/reminders/remind/${documentId}/${level}`);
    },

    getHistory: async (documentId?: string): Promise<ReminderLog[]> => {
        const query = documentId ? `?document_id=${documentId}` : '';
        return api.get<ReminderLog[]>(`/api/v1/reminders/history${query}`);
    },
};
