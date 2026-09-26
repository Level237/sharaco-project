// features/quotes/types/index.ts

export type DocumentType = 'DEVIS' | 'FACTURE';
export type DocumentStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REFUSED' | 'PAID' | 'OVERDUE';

export interface DocumentItem {
    id: string;
    description: string;
    quantity: number;
    unit_price_cents: number;
    tax_rate: number;
    document_id: string;
}

// Interface pour une échéance / jalon de paiement
export interface MilestonePreview {
    id?: string;
    sequence: number;
    title: string;
    percent: number;
    amount_cents?: number;
    status?: string;
    description?: string | null;
    trigger_date?: string | null;
    invoice_id?: string | null;
}

export interface Document {
    id: string;
    type: DocumentType;
    status: DocumentStatus;
    number?: string;
    created_at: string;
    due_date?: string;
    sent_at?: string;
    viewed_at?: string;
    paid_at?: string;
    accepted_at?: string;
    refused_at?: string;
    layout_style?: string;
    user_id: string;
    client_id: string;
    template_id?: string;
    items?: DocumentItem[];
    subtotal_cents?: number;
    tax_total_cents?: number;
    grand_total_cents?: number;
    total_cents?: number; // Rétrocompatibilité
    notes?: string | null;
    client_token?: string;
    share_token?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    project_id?: string | null;
    font_family?: string;
    show_bank_details?: boolean;
    show_tax_id?: boolean;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    client_address?: string;
    client?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    payment_schedule?: MilestonePreview[];
}

export interface DocumentCreate {
    id?: string;
    type: string;
    client_id?: string;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    client_address?: string;
    project_id?: string | null;
    layout_style?: string;
    items: Array<{
        description: string;
        quantity: number;
        unit_price_cents: number;
        tax_rate: number;
    }>;
    template_id?: string | null;
    due_date?: string | null;
    notes?: string | null;
    payment_schedule?: MilestonePreview[] | null;
}

export interface DocumentStatusUpdate {
    status: DocumentStatus;
}

/**
 * Requête d'aperçu de document pour le endpoint POST /documents/preview
 */
export interface DocumentPreviewRequest {
    type?: string;
    client_name?: string;
    client_email?: string;
    client_address?: string;
    client_phone?: string;
    items: {
        description: string;
        quantity: number;
        unit_price_cents: number;
        tax_rate?: number;
    }[];
    template_id?: string | null;
    layout_style?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    text_color?: string;
    background_color?: string;
    font_family?: string;
    header_text?: string | null;
    footer_text?: string | null;
    show_bank_details?: boolean;
    show_tax_id?: boolean;
    notes?: string | null;
    reference?: string | null;
    payment_schedule?: MilestonePreview[] | null;
}

// Re-export de QuoteDraft pour useAutoSave et useDocumentUpdate
export type { QuoteDraft } from './QuoteBuilder';