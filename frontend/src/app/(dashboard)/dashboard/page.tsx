// app/dashboard/page.tsx
"use client";

import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { DocumentsStats } from "@/features/quotes/components/DocumentsStats";
import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/features/auth/api/authApi';

import { toast } from 'sonner';
import { OnboardingTour } from "@/features/dashboard/components/OnboardingTour";
import { OverdueAlertBanner } from "@/features/dashboard/components/OverdueAlertBanner";
import { CompleteProfileModal } from "@/features/dashboard/components/CompleteProfileModal";

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isChecking, setIsChecking] = useState(true);

    const { token, setToken, setUser, isAuthenticated } = useAuthStore();
    const hasProcessedOAuth = useRef(false);
    const hasShownWelcome = useRef(false);

    useEffect(() => {
        const run = async () => {
            const urlCode = searchParams.get('code');
            const urlToken = searchParams.get('token'); // Fallback de compatibilité

            if ((urlCode || urlToken) && !hasProcessedOAuth.current) {
                hasProcessedOAuth.current = true;

                try {
                    let activeToken = urlToken;
                    if (urlCode) {
                        const res = await authApi.exchangeOAuthCode(urlCode);
                        activeToken = res.access_token;
                    }

                    if (activeToken) {
                        setToken(activeToken);
                        const user = await authApi.getMe();
                        setUser(user);

                        // Toast de bienvenue après connexion
                        if (!hasShownWelcome.current) {
                            hasShownWelcome.current = true;
                            toast.success('Connexion réussie !', {
                                description: 'Bienvenue sur votre espace de gestion Sharaco.',
                                duration: 4000,
                            });
                        }
                    }
                } catch (err) {
                    console.error("Erreur finalisation connexion:", err);
                    toast.error("Erreur de connexion", {
                        description: "Le lien d'autorisation a expiré ou est invalide.",
                    });
                }

                router.replace('/dashboard');
                setIsChecking(false);
                return;
            }

            if (!urlCode && !urlToken) {
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
                <div className="text-sm font-medium text-zinc-400">Vérification de la session...</div>
            </div>
        );
    }

    return (
        <>
            {/* ✅ Tour automatique au premier lancement */}
            <OnboardingTour />

            {/* ✅ Modal automatique si le profil est incomplet */}
            <CompleteProfileModal />

            {/* ✅ Conteneur sans double padding : le padding externe est géré par layout.tsx */}
            <div className="space-y-6 md:space-y-8">
                {/* ═══════════ EN-TÊTE / ACTION BAR ═══════════ */}
                <div className="flex items-center justify-between gap-4" data-tour="dashboard-title">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            Tableau de bord
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                            Vue d'ensemble de votre activité financière
                        </p>
                    </div>

                    <Link
                        href="/dashboard/quotes/create"
                        className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nouveau devis</span>
                    </Link>
                </div>

{/* ═══════════ CARROUSEL KPI / STATS ═══════════ */}
                <div data-tour="dashboard-stats">
                    <DocumentsStats />
                </div>

                {/* ═══════════ BANNIÈRE ALERTES IMPAYÉS ═══════════ */}
                <OverdueAlertBanner />


                {/* ═══════════ ACTIVITÉ RÉCENTE ═══════════ */}
                <div className="pt-2 md:pt-4" data-tour="dashboard-activity">
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Activité récente
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                            Suivez les dernières actions sur vos projets, devis et factures.
                        </p>
                    </div>
                    <ActivityFeed limit={20} />
                </div>
            </div>
        </>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
                <div className="text-sm font-medium text-zinc-400">Chargement du tableau de bord...</div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}