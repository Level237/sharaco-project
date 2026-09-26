// features/quotes/components/EditorHeader.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ChevronLeft, Save, Minus, Plus, Maximize, CheckCircle2,
    Loader2, AlertCircle, Edit3, MoreVertical, Mail, FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteDraft } from "../../types/QuoteBuilder";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Logo from "@/components/ui/logo";
import { SendEmailModal } from "../sendEmailModal";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
    draft: QuoteDraft;
    documentId: string | null;
    documentNumber: string | null;
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
    onSave?: () => void;
    onColorChange?: (color: string) => void;
    showActions?: boolean;
    setShowActions?: (show: boolean) => void;
    downloadPdf: () => void;
    isDownloading: boolean;
    isSaving?: boolean;
    lastSavedAt?: Date | null;
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    hasUnsavedChanges?: boolean;
    isEditMode?: boolean;
}

const BRAND_COLORS = [
    { name: "Sky", value: "#0ea5e9" },
    { name: "Emerald", value: "#10b981" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Zinc", value: "#71717a" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Orange", value: "#f97316" },
];

export function EditorHeader({
    draft,
    zoom,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onSave,
    onColorChange,
    showActions,
    setShowActions,
    documentId,
    documentNumber,
    downloadPdf,
    isDownloading,
    isSaving = false,
    lastSavedAt = null,
    saveStatus = 'idle',
    hasUnsavedChanges = false,
    isEditMode = false,
}: EditorHeaderProps) {

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    const handleEmailSent = () => {
        console.log("Email envoyé avec succès");
    };

    return (
        <>
            <header className={cn(
                "fixed top-0 left-0 right-0 flex items-center justify-between",
                "bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5 z-[100]",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
                // Hauteur responsive
                "h-14 sm:h-16 md:h-[72px]",
                // Padding responsive
                "px-3 sm:px-4 md:px-6"
            )}>
                {/* ═══════════ LEFT SECTION ═══════════ */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0 shrink-0">
                    <Link href="/dashboard/quotes">
                        <motion.div
                            whileHover={{ x: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/20 group bg-zinc-900/40 backdrop-blur-md"
                            >
                                <ChevronLeft className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                            </Button>
                        </motion.div>
                    </Link>

                    {/* Logo (caché sur très petit écran) */}
                    <div className="hidden sm:flex flex-col">
                        <Link href="/dashboard" className="flex items-center gap-3 group">
                            <div className="shadow-sm group-hover:scale-105 group-hover:rotate-2 transition-all duration-500">
                                <Logo width={120} height={120} />
                                
                            </div>
                        </Link>
                    </div>

                    {/* Titre document sur mobile (remplace le logo) */}
                    <div className="sm:hidden flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {isEditMode ? "Édition" : "Nouveau"}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                            {documentNumber || "Devis"}
                        </span>
                    </div>
                </div>

                {/* ═══════════ CENTER CONTROLS (desktop seulement) ═══════════ */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-3">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md shadow-inner">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                            onClick={onZoomOut}
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </Button>

                        <div className="flex items-center justify-center w-14">
                            <span className="text-[11px] font-black text-zinc-100">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                            onClick={onZoomIn}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>

                        <div className="w-px h-4 bg-white/10 mx-1" />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                            onClick={onResetZoom}
                        >
                            <Maximize className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Brand Color Selector (desktop) */}
                    <DropdownMenu open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
                        <DropdownMenuTrigger asChild>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md shadow-inner group hover:bg-white/10 transition-all min-w-[110px]"
                            >
                                <div className="relative flex items-center justify-center">
                                    <div
                                        className="w-3.5 h-3.5 max-sm:w-2 max-sm:h-2 rounded-full shadow-sm border border-white/20 transition-all"
                                        style={{ backgroundColor: draft.brandColor }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest font-mono">
                                    {draft.brandColor}
                                </span>
                            </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="center"
                            className="w-56 bg-zinc-900 border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl z-[120]"
                        >
                            <DropdownMenuLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1 pb-3">
                                Brand Palette
                            </DropdownMenuLabel>
                            <div className="grid grid-cols-6 gap-2 mb-3">
                                {BRAND_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => onColorChange?.(color.value)}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                                            draft.brandColor === color.value ? 'border-white' : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* ═══════════ RIGHT SECTION ═══════════ */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">

                    {/* Status Indicator (pill compact sur mobile) */}
                    <div className={cn(
                        "flex items-center rounded-xl bg-zinc-900/50 border border-white/5",
                        "px-2 py-1 md:px-3 md:py-1.5",
                        "gap-1 md:gap-2"
                    )}>
                        {hasUnsavedChanges ? (
                            <>
                                <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400 shrink-0" />
                                <span className="hidden sm:inline text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                    Non sauvegardé
                                </span>
                            </>
                        ) : saveStatus === 'saving' ? (
                            <>
                                <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-sky-400 animate-spin shrink-0" />
                                <span className="hidden sm:inline text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                                    Enregistrement...
                                </span>
                            </>
                        ) : lastSavedAt ? (
                            <>
                                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400 shrink-0" />
                                <span className="hidden sm:inline text-[10px] font-medium text-emerald-400">
                                    Sauvegardé
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                                <span className="hidden sm:inline text-[10px] font-medium text-zinc-500">
                                    Brouillon
                                </span>
                            </>
                        )}
                    </div>

                    {/* Color Picker (mobile/tablet seulement - bouton icône) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border border-white/5"
                            >
                                <div
                                    className="w-4 h-4 rounded-full shadow-sm border border-white/20"
                                    style={{ backgroundColor: draft.brandColor }}
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-60 bg-zinc-900 border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl z-[120]"
                        >
                            <DropdownMenuLabel className="text-[10px] max-sm:text-xs font-black text-zinc-500   px-1 pb-3">
                                Couleur de marque
                            </DropdownMenuLabel>
                            <div className="grid grid-cols-4 max-sm:grid-cols-6 gap-2.5">
                                {BRAND_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => onColorChange?.(color.value)}
                                        className={cn(
                                            "w-full aspect-square max-sm:w-7 max-sm:h-7 rounded-xl border-2 transition-all hover:scale-105 active:scale-95",
                                            draft.brandColor === color.value ? 'border-white' : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Bouton Enregistrer */}
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onSave?.();
                        }}
                        disabled={isSaving}
                        className={cn(
                            "rounded-xl text-white font-black cursor-pointer transition-all flex items-center active:scale-95 border-t border-white/20",
                            "h-9 sm:h-10",
                            "px-2.5 sm:px-4 md:px-6",
                            "text-xs sm:text-sm",
                            hasUnsavedChanges
                                ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_10px_20px_-10px_rgba(245,158,11,0.5)]'
                                : 'bg-gray-600 hover:bg-gray-500'
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isEditMode ? (
                            <Edit3 className="w-3.5 h-3.5 sm:mr-1 md:mr-2" strokeWidth={2} />
                        ) : (
                            <Save className="w-3.5 h-3.5 sm:mr-1 md:mr-2" strokeWidth={3} />
                        )}
                        <span className="hidden sm:inline">
                            {isSaving ? (
                                "..."
                            ) : isEditMode ? (
                                <span className="hidden md:inline">Mettre à jour</span>
                            ) : (
                                <span className="hidden md:inline">Enregistrer</span>
                            )}
                        </span>
                        {/* Texte court sur petit écran */}
                        <span className="sm:hidden">
                            {isSaving ? "..." : isEditMode ? "Save" : "Save"}
                        </span>
                    </Button>

                    {/* Menu Actions (⋮) — INCHANGÉ, contient Télécharger PDF + Email */}
                    <DropdownMenu open={showActions} onOpenChange={setShowActions}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 border border-white/5"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-72 bg-zinc-900 border-white/10 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl z-[110]"
                        >
                            <DropdownMenuGroup className="p-1">
                                <DropdownMenuLabel className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3 py-2">
                                    Actions rapides
                                </DropdownMenuLabel>

                                {/* Télécharger PDF */}
                                <DropdownMenuItem
                                    onClick={downloadPdf}
                                    disabled={isDownloading}
                                    className="flex flex-col items-start gap-0.5 p-3 focus:bg-white/5 rounded-xl cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 group-focus:text-sky-400 transition-colors">
                                                {isDownloading ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <FileDown className="w-3.5 h-3.5" />
                                                )}
                                            </div>
                                            <span className="font-bold text-zinc-200">
                                                {isDownloading ? "Génération..." : "Télécharger PDF"}
                                            </span>
                                        </div>
                                        <DropdownMenuShortcut className="text-zinc-600 hidden sm:inline">⌘P</DropdownMenuShortcut>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium pl-8">
                                        {isDownloading ? "Préparation..." : "Document prêt à imprimer"}
                                    </p>
                                </DropdownMenuItem>

                                {/* Envoyer par email */}
                                <DropdownMenuItem
                                    onClick={() => setIsEmailModalOpen(true)}
                                    className="flex flex-col items-start gap-0.5 p-3 focus:bg-white/5 rounded-xl cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 group-focus:text-emerald-400 transition-colors">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold text-zinc-200">Envoyer par email</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium pl-8">Envoi direct par email</p>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* SendEmailModal */}
            <SendEmailModal
                open={isEmailModalOpen}
                onOpenChange={setIsEmailModalOpen}
                documentId={documentId || ""}
                documentNumber={documentNumber || ""}
                clientEmail={draft.clientEmail}
                clientName={draft.clientName}
                onSent={handleEmailSent}
                documentLabel="devis"
            />
        </>
    );
}