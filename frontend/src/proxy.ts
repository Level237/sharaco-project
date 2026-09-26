// proxy.ts (ou middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // 1. On récupère le token dans les cookies ou le header x-auth
    const token = request.cookies.get('sharaco_token')?.value || request.headers.get('x-auth');

    // ✅ EXCEPTION CRUCIALE : 
    // Si l'URL contient un token OAuth (?token=... ou ?oauth_token=...),
    // on laisse passer. Le code React va créer le cookie juste après.
    const hasOAuthToken = searchParams.has('token') || searchParams.has('oauth_token');

    if (hasOAuthToken) {
        return NextResponse.next();
    }

    // 2. Si l'utilisateur essaie d'aller sur le dashboard sans token
    if (pathname.startsWith('/dashboard') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Si l'utilisateur est déjà connecté et essaie d'aller sur le login
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// ✅ J'ai ajouté '/signup' car votre flow Google redirige aussi vers /signup?oauth_token=...
export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};