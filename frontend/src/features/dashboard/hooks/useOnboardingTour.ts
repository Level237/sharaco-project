// hooks/useOnboardingTour.ts
import { useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'sharaco_tour_completed';

export function useOnboardingTour() {
    const startTour = useCallback(() => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            smoothScroll: true,
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            stagePadding: 6,
            stageRadius: 8,
            nextBtnText: 'Suivant →',
            prevBtnText: '← Précédent',
            doneBtnText: 'Fait 🎉',
            progressText: '{{current}} sur {{total}}',
            onDestroyed: () => {
                localStorage.setItem(TOUR_STORAGE_KEY, 'true');
            },
            steps: [
                {
                    element: '[data-tour="sidebar-create"]',
                    popover: {
                        title: '✨ Créez en un clic',
                        description: 'Utilisez ce bouton pour créer rapidement des devis, factures ou clients.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-projects"]',
                    popover: {
                        title: '📁 Vos Projets',
                        description: 'Gérez et suivez l\'avancement de tous vos projets au même endroit.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-devis"]',
                    popover: {
                        title: '📄 Devis et Factures',
                        description: 'Créez des devis professionnels et transformez-les en factures en un instant.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-clients"]',
                    popover: {
                        title: '🤝 Vos Clients',
                        description: 'Centralisez toutes les informations et l\'historique de vos clients.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-notifications"]',
                    popover: {
                        title: '🔔 Notifications',
                        description: 'Restez informé des mises à jour importantes sur vos projets.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-profile"]',
                    popover: {
                        title: '👤 Votre profil',
                        description: 'Gérez votre compte et déconnectez-vous depuis ici.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="dashboard-title"]',
                    popover: {
                        title: '👋 Bienvenue sur Sharaco !',
                        description: 'Voici votre tableau de bord avec une vue d\'ensemble de votre activité.',
                        side: 'bottom',
                    },
                },
                {
                    element: '[data-tour="dashboard-stats"]',
                    popover: {
                        title: '📊 Vos statistiques',
                        description: 'Suivez l\'évolution de vos devis, factures et chiffre d\'affaires.',
                        side: 'bottom',
                    },
                },
                {
                    element: '[data-tour="dashboard-activity"]',
                    popover: {
                        title: '🕐 Activité récente',
                        description: 'Toutes les actions sur vos projets apparaissent ici en temps réel. C\'est parti !',
                        side: 'top',
                    },
                },
            ],
        });

        driverObj.drive();
    }, []);

    const autoStartTour = useCallback(() => {
        const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                startTour();
            }, 1000);
            return () => clearTimeout(timer);
        }
        return () => { };
    }, [startTour]);

    return { startTour, autoStartTour };
}