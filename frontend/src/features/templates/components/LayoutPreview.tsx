'use client';

import { useQuery } from '@tanstack/react-query';
import { templatesApi } from '../api/templatesApi';
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LayoutPreviewProps {
    
    layoutId: 'classic' | 'modern' | 'minimal';
    className?: string;
}

export function LayoutPreview({ layoutId, className }: LayoutPreviewProps) {
    const { data: html, isLoading } = useQuery({
        queryKey: ['layout-preview', layoutId],
        queryFn: () => templatesApi.getLayoutPreview(layoutId),
        staleTime: 1000 * 60 * 10, // cache 10 min
    });

    if (isLoading) {
        return (
            <div className={cn(
                className, 
                "flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden relative"
            )}>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                    </div>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Engine Rendering...</span>
                </div>
            </div>
        );
    }

    return (
        <iframe
            srcDoc={html}
            className={className}
            sandbox=""           // sécurité : pas de scripts, pas de navigation
            title={`Aperçu ${layoutId}`}
        />
    );
}