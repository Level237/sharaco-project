// hooks/useBeforeUnload.ts
'use client';

import { useEffect } from 'react';

export function useBeforeUnload(hasUnsavedChanges: boolean, message?: string) {
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = message || 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges, message]);
}