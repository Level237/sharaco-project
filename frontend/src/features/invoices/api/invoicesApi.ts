import { api } from '@/lib/api';
import type { Document, DocumentCreate, DocumentStatus } from '@/features/quotes/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const invoicesApi = {
    getAll: async (): Promise<Document[]> => {
        return api.get<Document[]>('/api/v1/documents?type=FACTURE');
    },

    getById: async (id: string): Promise<Document> => {
        return api.get<Document>(`/api/v1/documents/${id}`);
    },

    markAsPaid: async (invoiceId: string): Promise<{
        message: string;
        invoice_number: string;
        milestone_updated: boolean;
        already_paid: boolean;
    }> => {
        const token = localStorage.getItem('sharaco_token');
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/invoices/${invoiceId}/mark-paid`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Erreur marquage payée');
        }
        return res.json();
    },
    create: async (data: DocumentCreate): Promise<Document> => {
        return api.post<Document>('/api/v1/documents', data);
    },

    update: async (id: string, data: unknown): Promise<Document> => {
        return api.put<Document>(`/api/v1/documents/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete<void>(`/api/v1/documents/${id}`);
    },

    updateStatus: async (id: string, status: DocumentStatus): Promise<Document> => {
        return api.patch<Document>(`/api/v1/documents/${id}/status`, { status });
    },

    getPreview: async (id: string): Promise<string> => {
        return api.get<string>(`/api/v1/documents/${id}/preview`);
    },

    getPdfUrl: (id: string): string => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sharaco_token') : null;
        return token
            ? `${API_URL}/api/v1/documents/${id}/pdf?token=${encodeURIComponent(token)}`
            : `${API_URL}/api/v1/documents/${id}/pdf`;
    },

    downloadPdf: async (id: string, filename?: string): Promise<void> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sharaco_token') : null;
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/v1/documents/${id}/pdf`, { headers });

        if (!res.ok) {
            throw new Error(`Erreur lors du téléchargement du PDF (${res.status})`);
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `facture-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
};