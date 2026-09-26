// hooks/useAutoSave.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { quotesApi } from '@/features/quotes/api/quotesApi';
import type { QuoteDraft } from '@/features/quotes/types';

interface UseAutoSaveProps {
    draft: QuoteDraft;
    enabled?: boolean;
}

export function useAutoSave({ draft, enabled = true }: UseAutoSaveProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    
    const [documentId, setDocumentId] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    
    const draftRef = useRef(draft);
    const hasChangesRef = useRef(false);
    const saveInProgressRef = useRef(false);
    const autoSaveEnabledRef = useRef(true);

    useEffect(() => {
        draftRef.current = draft;
    }, [draft]);

    // Auto-save UNIQUEMENT pour la première création
    useEffect(() => {
        if (!enabled || !autoSaveEnabledRef.current || isSaved || isSaving) return;

        const timer = setTimeout(async () => {
            if (hasChangesRef.current) {
                await saveDraft(false);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [draft, enabled, isSaved, isSaving]);

    const saveDraft = useCallback(async (forceSave = false) => {
        if (!enabled) return;
        
        if (saveInProgressRef.current) return;

        saveInProgressRef.current = true;
        setIsSaving(true);
        setSaveStatus('saving');

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
    template_id: null,
    payment_schedule: draft.paymentMode === 'schedule' && draft.paymentMilestones && draft.paymentMilestones.length > 0
            ? draft.paymentMilestones.map((ms: any, idx: number) => ({
                sequence: idx + 1,
                title: ms.title || `Échéance ${idx + 1}`,
                percent: ms.percent,
                description: ms.description || null,
                trigger_date: ms.trigger_date || null,
            }))
            : null,
    due_date: draftRef.current.validityDays 
        ? new Date(Date.now() + draftRef.current.validityDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    notes: draftRef.current.notes || undefined,
    // ✅ NOUVEAU : Envoyer les couleurs aussi à la création
    primary_color: draftRef.current.brandColor || "#2563EB",
    secondary_color: "#1E40AF",
    accent_color: "#DBEAFE",
    background_color: "#FFFFFF",
    text_color: "#1F2937",
    font_family: "Inter",
    show_bank_details: true,
    show_tax_id: true,
};

            console.log('✨ CREATE - Payload:', payload);

            const response = await quotesApi.create({
                ...payload,
                id: undefined,
            } as any);

            console.log('✅ CREATE réussi, ID:', response.id);

            if (response?.id) {
                setDocumentId(response.id);
                setIsSaved(true);
                autoSaveEnabledRef.current = false; // Désactiver après première création
            }

            setLastSavedAt(new Date());
            setSaveStatus('saved');
            hasChangesRef.current = false;
            
            toast({
                title: 'Brouillon enregistré',
                description: 'Votre document a été créé.',
                duration: 2000,
            });

        } catch (error: any) {
            console.error('❌ Erreur création:', error);
            setSaveStatus('error');
            toast({
                title: 'Erreur de sauvegarde',
                description: error.response?.data?.detail || 'Impossible de créer le document.',
                variant: 'destructive',
                duration: 3000,
            });
        } finally {
            setIsSaving(false);
            saveInProgressRef.current = false;
        }
    }, [enabled, toast]);

    const markAsChanged = useCallback(() => {
        hasChangesRef.current = true;
    }, []);

    return {
        isSaving,
        lastSavedAt,
        saveStatus,
        documentId,
        isSaved,
        hasChanges: hasChangesRef.current,
        markAsChanged,
        setDocumentId,
        setIsSaved,
    };
}