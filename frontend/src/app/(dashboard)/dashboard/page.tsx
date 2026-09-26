// app/dashboard/page.tsx
"use client";

import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { DocumentsStats } from "@/features/quotes/components/DocumentsStats";
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/features/auth/api/authApi';

import { toast } from 'sonner';
import { OnboardingTour } from "@/features/dashboard/components/OnboardingTour";
import { OverdueAlertBanner } from "@/features/dashboard/components/OverdueAlertBanner";

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isChecking, setIsChecking] = useState(true);

    const { token, setToken, setUser, isAuthenticated } = useAuthStore();
    const hasProcessedOAuth = useRef(false);
    const hasShownWelcome = useRef(false);

    useEffect(() => {
        const run = async () => {
            const urlToken = searchParams.get('token');

            if (urlToken && !hasProcessedOAuth.current) {
                hasProcessedOAuth.current = true;
                setToken(urlToken);

                try {
                    const user = await authApi.getMe();
                    setUser(user);

                    // Toast de bienvenue après inscription
                    if (!hasShownWelcome.current) {
                        hasShownWelcome.current = true;
                        toast.success('Compte créé avec succès !', {
                            description: 'Bienvenue sur Sharaco. Suivez le guide pour commencer.',
                            duration: 5000,
                        });
                    }
                } catch (err) {
                    console.error("Erreur récupération profil:", err);
                }

                router.replace('/dashboard');
                setIsChecking(false);
                return;
            }

            if (!urlToken) {
                const storedToken = typeof window !== 'undefined' ? localStorage.getItem('sharaco_token') : null;

                if (!storedToken && !token && !isAuthenticated) {
                    router.replace('/login');
                    return;
                }
            }

            setIsChecking(false);
        };

        run();
    }, [searchParams, router, setToken, setUser, token, isAuthenticated]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-zinc-500">Vérification de la connexion...</div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ Tour automatique au premier lancement */}
            <OnboardingTour />

            <div className="flex-1  space-y-8 p-4 md:p-8 pt-6 min-h-screen">
                <div data-tour="dashboard-title">
                    <h1 className="text-3xl font-black tracking-tight text-white">
                        Tableau de bord
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Vue d'ensemble de votre activité
                    </p>
                </div>
                
                <div data-tour="dashboard-stats">
                    <DocumentsStats />
                </div>

                <div className="mt-12 md:mt-16" data-tour="dashboard-activity">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Activité récente
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Suivez les dernières actions sur vos projets et devis.
                        </p>
                    </div>
                    <ActivityFeed limit={20} />
                </div>
            </div>
        </>
    );
}