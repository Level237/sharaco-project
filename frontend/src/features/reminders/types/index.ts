export interface ReminderConfig {
    id: string;
    user_id: string;
    reminder_1_enabled: boolean;
    reminder_1_days: number;
    reminder_1_subject: string;
    reminder_2_enabled: boolean;
    reminder_2_days: number;
    reminder_2_subject: string;
    reminder_3_enabled: boolean;
    reminder_3_days: number;
    reminder_3_subject: string;
    is_active: boolean;
    stop_on_view: boolean;
    stop_on_payment: boolean;
    created_at: string;
    updated_at: string;
}

export interface ReminderConfigUpdate {
    reminder_1_enabled?: boolean;
    reminder_1_days?: number;
    reminder_1_subject?: string;
    reminder_2_enabled?: boolean;
    reminder_2_days?: number;
    reminder_2_subject?: string;
    reminder_3_enabled?: boolean;
    reminder_3_days?: number;
    reminder_3_subject?: string;
    is_active?: boolean;
    stop_on_view?: boolean;
    stop_on_payment?: boolean;
}

export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface ReminderLog {
    id: string;
    document_id: string;
    reminder_level: number;
    status: ReminderStatus;
    sent_at?: string;
    error_message?: string;
}

export type ReminderJournalKind = "devis" | "facture";

export interface ReminderJournalEntry {
    id: string;
    kind: ReminderJournalKind;
    document_id: string;
    document_number?: string | null;
    client_name?: string | null;
    client_email?: string | null;
    step_label: string;
    reminder_level?: number | null;
    status: ReminderStatus;
    sent_at?: string | null;
    error_message?: string | null;
}