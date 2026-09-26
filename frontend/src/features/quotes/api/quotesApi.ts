// features/quotes/api/quotesApi.ts
import { api } from '@/lib/api';
import type { Document, DocumentCreate, DocumentStatus, DocumentPreviewRequest } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const quotesApi = {
    getAll: async (params?: {
        type?: string;
        project_id?: string;  // ✅ NOUVEAU
    }): Promise<Document[]> => {
        const query = new URLSearchParams();
        if (params?.type) query.set('type', params.type);
        if (params?.project_id) query.set('project_id', params.project_id);

        const queryString = query.toString();
        return api.get<Document[]>(`/api/v1/documents?type=DEVIS${queryString ? `?${queryString}` : ''}`);
    },

    generateNextInvoice: async (quoteId: string): Promise<{
        message: string;
        invoice_id: string;
        invoice_number: string;
        milestone_title: string;
        milestone_percent: number;
        milestone_amount_cents: number;
        remaining_milestones: number;
    }> => {
        const token = localStorage.getItem('sharaco_token');
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${quoteId}/next-invoice`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Erreur génération facture');
        }
        return res.json();
    },
    getById: async (id: string): Promise<Document> => {
        return api.get<Document>(`/api/v1/documents/${id}`);
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

    convertToInvoice: async (id: string): Promise<Document> => {
        return api.post<Document>(`/api/v1/documents/${id}/convert`);
    },

    getPreview: async (id: string): Promise<string> => {
        return api.get<string>(`/api/v1/documents/${id}/preview`);
    },

    linkToProject: async (documentId: string, projectId: string | null): Promise<Document> => {
        return api.patch<Document>(`/api/v1/documents/${documentId}/project`, {
            project_id: projectId
        });
    },

    unlinkFromProject: async (documentId: string): Promise<Document> => {
        return api.delete<Document>(`/api/v1/documents/${documentId}/project`);
    },

    /**
     * Récupère la preview PNG d'un document avec authentification.
     * Retourne un Blob URL utilisable dans <img src="...">.
     * ⚠️ IMPORTANT : L'appelant doit appeler URL.revokeObjectURL() pour libérer la mémoire.
     */
    getPreviewPngBlob: async (id: string): Promise<string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sharaco_token') : null;
    const headers: Record<string, string> = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // ✅ Cache bust : timestamp unique à chaque appel
    const cacheBuster = `_t=${Date.now()}`;

    const res = await fetch(`${API_URL}/api/v1/documents/${id}/preview.png?${cacheBuster}`, {
        headers,
        // ✅ SUPPRIMER cache: 'force-cache'
        // Ne rien mettre = comportement par défaut (respecte les headers HTTP)
    });

    if (!res.ok) {
        throw new Error(`Erreur preview PNG (${res.status})`);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
},
    getPdfUrl: (id: string): string => {
        return `${API_URL}/api/v1/documents/${id}/pdf`;
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
        link.download = filename || `devis-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    downloadPreviewPdf: async (previewData: DocumentPreviewRequest): Promise<Blob> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sharaco_token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const cacheBuster = `_t=${Date.now()}`;

        const res = await fetch(`${API_URL}/api/v1/documents/preview/pdf?${cacheBuster}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(previewData),
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            throw new Error(`Erreur lors de la génération du PDF (${res.status}): ${errorText}`);
        }

        return res.blob();
    },
};