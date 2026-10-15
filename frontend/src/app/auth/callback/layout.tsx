import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Connexion | Sharaco',
    description: 'Finalisation de la connexion Google vers Sharaco.',
};

export default function AuthCallbackLayout({ children }: { children: ReactNode }) {
    return children;
}
