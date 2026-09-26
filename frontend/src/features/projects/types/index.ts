// features/projects/types.ts

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';

export type AttachmentType = 'CDC' | 'CONTRACT' | 'SPEC' | 'OTHER';

export interface ProjectAttachment {
    id: string;
    name: string;
    file_url: string;
    file_type: AttachmentType;
    uploaded_at: string;
    project_id: string;
    user_id: string;
}

export interface ProjectTreeMilestone {
    id: string;
    sequence: number;
    title: string;
    percent: number;
    amount_cents: number;
    description?: string | null;
    trigger_date?: string | null;
    status: string;
    invoice_id?: string | null;
}

export interface ProjectTreeInvoice {
    id: string;
    number?: string | null;
    invoice_type?: string | null;
    status: string;
    due_date?: string | null;
    issued_at?: string | null;
    amount_cents: number;
    milestone_id?: string | null;
    milestone_title?: string | null;
    days_late?: number | null;
}

export interface ProjectTreeQuoteSummary {
    quoted_amount: number;
    invoiced_amount: number;
    paid_amount: number;
    overdue_amount: number;
    pending_amount: number;
}

export interface ProjectTreeQuote {
    id: string;
    number?: string | null;
    status: string;
    created_at: string;
    accepted_at?: string | null;
    amount_cents: number;
    milestones: ProjectTreeMilestone[];
    invoices: ProjectTreeInvoice[];
    summary: ProjectTreeQuoteSummary;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    budget_cents?: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at?: string;
    user_id: string;
    client_id: string;
    client_name?: string;
    documents_count?: number;
    total_invoiced_cents?: number;
    attachments?: ProjectAttachment[];
}

export interface ProjectTreeStandaloneInvoice {
    id: string;
    number?: string | null;
    status: string;
    due_date?: string | null;
    amount_cents: number;
    days_late?: number | null;
}

export interface ProjectTreeSummary {
    total_quoted: number;
    total_invoiced: number;
    total_paid: number;
    total_overdue: number;
    total_pending: number;
    quote_count: number;
    invoice_count: number;
    paid_invoice_count: number;
    overdue_invoice_count: number;
    invoicing_rate: number;
    collection_rate: number;
}

export interface ProjectTreeResponse {
    project_id: string;
    project_name: string;
    client_id?: string | null;
    client_name?: string | null;
    quotes: ProjectTreeQuote[];
    standalone_invoices: ProjectTreeStandaloneInvoice[];
    summary: ProjectTreeSummary;
}

export interface ProjectCreate {
    name: string;
    description?: string;
    status?: ProjectStatus;
    budget_cents?: number;
    start_date?: string;
    end_date?: string;
    client_id: string;
}

export interface ProjectUpdate {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    budget_cents?: number;
    start_date?: string;
    end_date?: string;
    client_id?: string;
}

export interface ProjectAttachmentCreate {
    name: string;
    file_url: string;
    file_type?: AttachmentType;
}