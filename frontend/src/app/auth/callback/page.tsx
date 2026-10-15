'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/features/auth/api/authApi';
import { API_URL } from '@/lib/api';

function OAuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setToken, setUser } = useAuthStore();

    // Le code est à usage unique : React StrictMode (dev) exécute
    // les effets deux fois, le second appel échouerait sans cette garde.
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const code = searchParams.get('code');
        if (!code) {
            router.replace('/login?error=oauth_missing_code');
            return;
        }

        const finishLogin = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/auth/oauth/exchange`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                });

                if (!res.ok) {
                    throw new Error(`Échec de l'échange du code : ${res.status}`);
                }

                const { access_token } = await res.json();

                // Pose le cookie/store utilisé par la protection de /dashboard
                setToken(access_token);

                try {
                    const user = await authApi.getMe();
                    setUser(user);
                } catch (err) {
                    console.error('Erreur lors de la récupération du profil:', err);
                }

                router.replace('/dashboard');
            } catch (err) {
                console.error(err);
                router.replace('/login?error=oauth_failed');
            }
        };

        finishLogin();
    }, [searchParams, router, setToken, setUser]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-zinc-500">Connexion en cours...</p>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-sm text-zinc-500">Connexion en cours...</p>
                </div>
            }
        >
            <OAuthCallbackInner />
        </Suspense>
    );
}