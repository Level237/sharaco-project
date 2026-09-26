// hooks/useDocumentUpdate.ts
'use client';

import { useCallback, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { quotesApi } from '@/features/quotes/api/quotesApi';
import type { QuoteDraft } from '@/features/quotes/types';

interface UseDocumentUpdateProps {
    draft: QuoteDraft;
    documentId: string;
    onUpdateSuccess?: () => void;
}

export function useDocumentUpdate({ draft, documentId, onUpdateSuccess }: UseDocumentUpdateProps) {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'updating' | 'updated' | 'error'>('idle');
    
    const draftRef = useRef(draft);
    const documentIdRef = useRef(documentId);

    // Mettre à jour les refs quand les props changent
    if (draftRef.current !== draft) {
        draftRef.current = draft;
    }
    if (documentIdRef.current !== documentId) {
        documentIdRef.current = documentId;
    }

    const updateDocument = useCallback(async () => {
    if (!documentIdRef.current) {
        console.error('❌ documentId manquant');
        return;
    }

    setIsUpdating(true);
    setUpdateStatus('updating');

    try {
        const payload = {
            type: 'DEVIS',
            client_id: draftRef.current.clientId,
            items: draftRef.current.items.map((item: any) => ({
                description: item.description || "Article",
                quantity: Math.max(1, item.quantity || 1),
                unit_price_cents: Math.max(0, item.unitPrice || 0),
                tax_rate: draftRef.current.hasVat ? Math.min(100, Math.max(0, item.tax_rate ?? draftRef.current.vatRate ?? 20)) : 0,
            })),
            layout_style: draftRef.current.layoutStyle || "classic",
            template_id: draftRef.current.templateId || null,
            due_date: draftRef.current.validityDays 
                ? new Date(Date.now() + draftRef.current.validityDays * 24 * 60 * 60 * 1000).toISOString()
                : undefined,
            notes: draftRef.current.notes || undefined,
            // ✅ NOUVEAU : Envoyer les couleurs et styles
            primary_color: draftRef.current.brandColor || "#2563EB",
            payment_schedule: draft.paymentMode === 'schedule' && draft.paymentMilestones && draft.paymentMilestones.length > 0
            ? draft.paymentMilestones.map((ms: any, idx: number) => ({
                sequence: idx + 1,
                title: ms.title || `Échéance ${idx + 1}`,
                percent: ms.percent,
                description: ms.description || null,
                trigger_date: ms.trigger_date || null,
            }))
            : null,
            secondary_color: "#1E40AF",
            accent_color: "#DBEAFE",
            background_color: "#FFFFFF",
            text_color: "#1F2937",
            font_family: "Inter",
            show_bank_details: true,
            show_tax_id: true,
        };

        console.log('🔄 UPDATE - Payload:', payload);

        const response = await quotesApi.update(documentIdRef.current, payload);

        console.log('✅ UPDATE réussi:', response.id);

        setLastUpdatedAt(new Date());
        setUpdateStatus('updated');
        
        toast({
            title: 'Document mis à jour',
            description: 'Vos modifications ont été sauvegardées.',
            duration: 2000,
        });

        onUpdateSuccess?.();

    } catch (error: any) {
        console.error(' Erreur mise à jour:', error);
        setUpdateStatus('error');
        toast({
            title: 'Erreur de mise à jour',
            description: error.response?.data?.detail || 'Impossible de mettre à jour.',
            variant: 'destructive',
            duration: 3000,
        });
    } finally {
        setIsUpdating(false);
    }
}, [onUpdateSuccess, toast]);

    return {
        isUpdating,
        lastUpdatedAt,
        updateStatus,
        updateDocument,
    };
}