'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/features/auth/api/authApi';
import { API_URL } from '@/lib/api';
import { OAuthHandshake } from '@/features/auth/components/OAuthHandshake';

function OAuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setToken, setUser } = useAuthStore();
    const processed = useRef(false);
    const initialCode = searchParams.get('code');
    const [status, setStatus] = useState<'linking' | 'error'>(initialCode ? 'linking' : 'error');
    const [detail, setDetail] = useState(
        initialCode
            ? 'Google confirme votre identité auprès de Sharaco.'
            : 'Aucun code de connexion. Reprenez depuis la page de connexion.'
    );

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const code = searchParams.get('code');
        if (!code) return;

        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);

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
                setStatus('error');
                setDetail('La liaison n’a pas abouti. Le code a expiré ou a déjà été utilisé.');
            }
        };

        void finishLogin();
    }, [searchParams, router, setToken, setUser]);

    return <OAuthHandshake status={status} detail={detail} />;
}

export default function OAuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <OAuthHandshake
                    status="linking"
                    detail="Google confirme votre identité auprès de Sharaco."
                />
            }
        >
            <OAuthCallbackInner />
        </Suspense>
    );
}
