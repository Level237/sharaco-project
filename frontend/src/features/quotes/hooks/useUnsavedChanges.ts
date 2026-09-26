// hooks/useUnsavedChanges.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(hasUnsavedChanges: boolean) {
    const router = useRouter();

    useEffect(() => {
        if (!hasUnsavedChanges) return;

        const handleRouteChange = (url: string) => {
            const confirmed = window.confirm(
                'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
            );
            if (!confirmed) {
                throw new Error('Route change aborted');
            }
        };

        // Intercepter les changements de route
        const originalPush = router.push;
        router.push = (...args: Parameters<typeof router.push>) => {
            const confirmed = window.confirm(
                'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
            );
            if (confirmed) {
                originalPush.apply(router, args);
            }
        };

        return () => {
            router.push = originalPush;
        };
    }, [hasUnsavedChanges, router]);
}