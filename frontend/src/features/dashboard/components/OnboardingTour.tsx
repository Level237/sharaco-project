// components/onboarding/OnboardingTour.tsx
'use client';

import { useEffect } from 'react';
import { useOnboardingTour } from '../hooks/useOnboardingTour';

export function OnboardingTour() {
    const { autoStartTour } = useOnboardingTour();

    useEffect(() => {
        const cleanup = autoStartTour();
        return cleanup;
    }, [autoStartTour]);

    return null;
}