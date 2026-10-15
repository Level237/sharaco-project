// proxy.ts (ou middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get('sharaco_token')?.value || request.headers.get('x-auth');

    if (pathname.startsWith('/dashboard') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Si l'utilisateur est déjà connecté et essaie d'aller sur le login
    if ((pathname === '/login'  && token) || (pathname === '/signup' && token)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};