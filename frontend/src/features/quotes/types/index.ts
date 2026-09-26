// features/templates/types.ts

export type DocumentType = 'DEVIS' | 'FACTURE';
export type DocumentStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REFUSED'| 'PAID';

export interface DocumentItem {
    id: string;
    description: string;
    quantity: number;
    unit_price_cents: number;
    tax_rate: number;
    document_id: string;
}

// ✅ NOUVEAU : interface pour une échéance
export interface MilestonePreview {
    sequence: number;
    title: string;
    percent: number;
    description?: string | null;
    trigger_date?: string | null;
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
    layout_style?: string;
    user_id: string;
    client_id: string;
    template_id?: string;
    items?: DocumentItem[];
    subtotal_cents?: number;
    tax_total_cents?: number;
    total_cents?: number;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    project_id?: string | null;
    font_family?: string;
    show_bank_details?: boolean;
    show_tax_id?: boolean;
    client?: {
        id: string;
        name: string;
        email?: string;
    };
    // ✅ AJOUTÉ : échéancier sur le document retourné
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
    items: Array<{
        description: string;
        quantity: number;
        unit_price_cents: number;
        tax_rate: number;
    }>;
    template_id?: string | null;
    due_date?: string | null;
    notes?: string | null;
    // ✅ AJOUTÉ : échéancier à la création
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
    
    // ✅ AJOUTÉ : échéancier de paiement
    payment_schedule?: MilestonePreview[] | null;
}