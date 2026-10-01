'use client';

import { useEffect } from 'react';
import { useOnboardingTour } from '../hooks/useOnboardingTour';
import { useCurrentUser } from '@/features/auth/hooks/useAuth';

export function OnboardingTour() {
    const { autoStartTour } = useOnboardingTour();
    const { data: user, isLoading } = useCurrentUser();

    useEffect(() => {
        // On attend d'avoir chargé l'utilisateur avant de faire quoi que ce soit
        if (isLoading || !user) return;

        const cleanup = autoStartTour();
        return cleanup;
    }, [autoStartTour, isLoading, user]);

    return null;
}
