'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type HandshakeStatus = 'linking' | 'error';

type OAuthHandshakeProps = {
    status: HandshakeStatus;
    detail: string;
};

function GoogleMark() {
    return (
        <div className="grid size-14 place-items-center rounded-2xl bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:size-16">
            <svg viewBox="0 0 48 48" className="size-8 sm:size-9" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.4 5.5-6.3 6.9l6.3 5.3C37.4 41.3 44 36 44 24c0-1.3-.1-2.7-.4-3.5z" />
            </svg>
        </div>
    );
}

function Signal({
    width,
    active,
    reverse = false,
    delay = 0,
    color,
}: {
    width: number;
    active: boolean;
    reverse?: boolean;
    delay?: number;
    color: string;
}) {
    const travel = Math.max(width - 8, 0);

    return (
        <motion.span
            aria-hidden="true"
            className="absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: reverse ? travel : 0, opacity: 0.2 }}
            animate={
                active && travel > 0
                    ? { x: reverse ? [travel, 0] : [0, travel], opacity: [0.15, 1, 0.15] }
                    : { x: travel / 2, opacity: 0.85 }
            }
            transition={
                active && travel > 0
                    ? { duration: 1.45, repeat: Infinity, ease: 'easeInOut', delay }
                    : { duration: 0.2 }
            }
        />
    );
}

function Beam({ active }: { active: boolean }) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const node = trackRef.current;
        if (!node) return;
        const observer = new ResizeObserver(() => setWidth(node.clientWidth));
        observer.observe(node);
        setWidth(node.clientWidth);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={trackRef} className="relative h-8 min-w-0">
            <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-white/15" />
            <Signal width={width} active={active} color="#4285F4" />
            <Signal width={width} active={active} reverse delay={0.35} color="#2563EB" />
            <Signal width={width} active={active} delay={0.7} color="#34A853" />
        </div>
    );
}

export function OAuthHandshake({ status, detail }: OAuthHandshakeProps) {
    const reducedMotion = useReducedMotion();
    const linking = status === 'linking' && !reducedMotion;

    return (
        <div className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse at center, rgba(37,99,235,0.18), transparent 58%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-8">
                <p className="text-[11px] font-medium tracking-[0.22em] text-zinc-500 uppercase">
                    Session
                </p>

                <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <GoogleMark />
                        <span className="text-[11px] font-medium tracking-wide text-zinc-400">Google</span>
                    </div>

                    <Beam active={linking} />

                    <Image
                        src="/img/logo.png"
                        alt="Sharaco"
                        width={640}
                        height={160}
                        priority
                        className="h-auto w-[108px] object-contain sm:w-[210px]"
                    />
                </div>

                <p className="mt-10 max-w-md text-sm leading-relaxed text-zinc-300" role="status">
                    {detail}
                </p>

                {status === 'error' && (
                    <Link
                        href="/login"
                        className="mt-6 inline-flex h-11 w-fit items-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white active:scale-[0.98]"
                    >
                        Revenir à la connexion
                    </Link>
                )}
            </main>
        </div>
    );
}
