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
            steps: window.innerWidth < 768 ? [
                {
                    element: '[data-tour="mobile-tab-accueil"]',
                    popover: {
                        title: '🏠 Accueil',
                        description: 'Votre tableau de bord avec la vue d\'ensemble de votre activité.',
                        side: 'top',
                        align: 'center'
                    },
                },
                {
                    element: '[data-tour="mobile-tab-projets"]',
                    popover: {
                        title: '📁 Projets',
                        description: 'Gérez et suivez l\'avancement de tous vos projets en cours.',
                        side: 'top',
                        align: 'center'
                    },
                },
                {
                    element: '[data-tour="mobile-tab-devis"]',
                    popover: {
                        title: '📄 Devis',
                        description: 'Créez et envoyez vos propositions commerciales en quelques clics.',
                        side: 'top',
                        align: 'center'
                    },
                },
                {
                    element: '[data-tour="mobile-tab-factures"]',
                    popover: {
                        title: '💳 Factures',
                        description: 'Suivez vos paiements, relancez vos clients et gérez votre trésorerie.',
                        side: 'top',
                        align: 'center'
                    },
                },
                {
                    element: '[data-tour="mobile-tab-plus"]',
                    popover: {
                        title: '✨ Et plus encore',
                        description: 'Accédez à vos clients, vos paramètres et vos alertes depuis ce menu.',
                        side: 'top',
                        align: 'center'
                    },
                }
            ] : [
                {
                    element: '[data-tour="sidebar-tableau de bord"]',
                    popover: {
                        title: '🏠 Accueil',
                        description: 'Votre tableau de bord avec la vue d\'ensemble de votre activité.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-projets"]',
                    popover: {
                        title: '📁 Projets',
                        description: 'Gérez et suivez l\'avancement de tous vos projets en cours.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-devis"]',
                    popover: {
                        title: '📄 Devis',
                        description: 'Créez et envoyez vos propositions commerciales en quelques clics.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-factures"]',
                    popover: {
                        title: '💳 Factures',
                        description: 'Suivez vos paiements, relancez vos clients et gérez votre trésorerie.',
                        side: 'right',
                    },
                },
                {
                    element: '[data-tour="sidebar-clients"]',
                    popover: {
                        title: '🤝 Clients',
                        description: 'Gérez votre base de contacts et l\'historique de vos relations.',
                        side: 'right',
                    },
                },
            ],
        });

        driverObj.drive();
    }, []);

    const autoStartTour = useCallback(() => {
        const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
        if (hasSeenTour) return () => { };

        // Vérifie si les conditions sont réunies pour lancer le guide
        const checkAndStart = () => {
            // 1. Si une modale est ouverte (ex: CompleteProfileModal), on attend !
            if (document.querySelector('[role="dialog"]')) return false;

            // 2. On s'assure que le menu est bien rendu dans le DOM
            const isMobile = window.innerWidth < 768;
            const target = isMobile 
                ? document.querySelector('[data-tour="mobile-tab-accueil"]')
                : document.querySelector('[data-tour="sidebar-tableau de bord"]');
            
            if (!target) return false;

            startTour();
            return true;
        };

        let interval: NodeJS.Timeout;
        
        // On attend 500ms pour laisser le temps aux modales de s'afficher (animations)
        const timer = setTimeout(() => {
            if (!checkAndStart()) {
                // Si les conditions ne sont pas réunies (ex: modale profil ouverte),
                // on vérifie en boucle toutes les secondes jusqu'à ce que ce soit bon.
                interval = setInterval(() => {
                    if (checkAndStart()) {
                        clearInterval(interval);
                    }
                }, 1000);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            if (interval) clearInterval(interval);
        };
    }, [startTour]);

    return { startTour, autoStartTour };
}