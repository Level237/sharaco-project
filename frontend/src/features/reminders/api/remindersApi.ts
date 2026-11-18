import { api } from '@/lib/api';
import type { ReminderConfig, ReminderConfigUpdate, ReminderLog } from '../types';

export const remindersApi = {
    getConfig: async (): Promise<ReminderConfig> => {
        return api.get<ReminderConfig>('/api/v1/reminders/config');
    },

    updateConfig: async (data: ReminderConfigUpdate): Promise<ReminderConfig> => {
        const days = (value: number | undefined, fallback: number) => {
            const n = Number(value);
            return Number.isFinite(n) && n >= 1 ? Math.min(60, Math.round(n)) : fallback;
        };
        return api.put<ReminderConfig>('/api/v1/reminders/config', {
            reminder_1_enabled: !!data.reminder_1_enabled,
            reminder_1_days: days(data.reminder_1_days, 2),
            reminder_1_subject: (data.reminder_1_subject || '').trim(),
            reminder_2_enabled: !!data.reminder_2_enabled,
            reminder_2_days: days(data.reminder_2_days, 5),
            reminder_2_subject: (data.reminder_2_subject || '').trim(),
            reminder_3_enabled: !!data.reminder_3_enabled,
            reminder_3_days: days(data.reminder_3_days, 10),
            reminder_3_subject: (data.reminder_3_subject || '').trim(),
            is_active: !!data.is_active,
            stop_on_view: !!data.stop_on_view,
            stop_on_payment: data.stop_on_payment !== false,
        });
    },

    sendDocument: async (documentId: string): Promise<void> => {
        return api.post<void>(`/api/v1/reminders/documents/${documentId}/send`);
    },

    sendReminder: async (documentId: string, level: number): Promise<void> => {
        return api.post<void>(`/api/v1/reminders/documents/${documentId}/remind/${level}`);
    },

    getHistory: async (documentId?: string): Promise<ReminderLog[]> => {
        if (!documentId) return [];
        return api.get<ReminderLog[]>(`/api/v1/reminders/documents/${documentId}/history`);
    },
};
