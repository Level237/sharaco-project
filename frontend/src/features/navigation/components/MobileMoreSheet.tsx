// features/navigation/components/MobileMoreSheet.tsx
"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
    X, ChevronRight, LogOut, Wallet, Settings2, Bell, HelpCircle
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/store/auth-store"
import { useOnboardingTour } from "@/features/dashboard/hooks/useOnboardingTour"
import { navItems } from "../data/navItemsData"


interface MobileMoreSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Routes déjà dans la bottom bar → exclues du menu "Plus"
const BOTTOM_TAB_HREFS = [
    "/dashboard",
    "/dashboard/projects",
    "/dashboard/quotes",
    "/dashboard/invoices",
]

// ⚠️ Section Compte — ajuste les href selon tes pages réelles
const ACCOUNT_ITEMS = [
    {
        title: "Paramètres & Facturation",
        desc: "Profil, coordonnées bancaires & sécurité",
        icon: Settings2,
        href: "/dashboard/settings",
    },
]

export function MobileMoreSheet({ open, onOpenChange }: MobileMoreSheetProps) {
    const { data: user } = useCurrentUser()
    const logout = useAuthStore((s) => s.logout)
    const { startTour } = useOnboardingTour()

    // Items de nav non présents dans la bottom bar (Clients, Modèles, etc.)
    const generalItems = navItems.filter(
        (item) => !item.isHeader && item.href && !BOTTOM_TAB_HREFS.includes(item.href)
    )

    const close = () => onOpenChange(false)

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 32, stiffness: 300 }}
                    className="fixed inset-0 z-[90] md:hidden bg-[#0a0a0a] flex flex-col"
                    style={{
                        paddingTop: "env(safe-area-inset-top)",
                        paddingBottom: "env(safe-area-inset-bottom)",
                    }}
                >
                    {/* ═══════════ HEADER ═══════════ */}
                    <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-white/5">
                        <span className="text-sm font-black text-white">
                            Menu
                        </span>
                        <button
                            onClick={close}
                            className="h-10 w-10 flex items-center justify-center -mr-2 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-white/5 active:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <ScrollArea className="flex-1">
                        {/* ═══════════ CARTE PROFIL ═══════════ */}
                        <Link href="/dashboard/settings" onClick={close} className="block mx-4 mt-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 active:scale-[0.98] transition-transform">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#2563EB] to-indigo-600 flex items-center justify-center text-white font-black text-lg uppercase shrink-0">
                                    {user?.full_name ? user.full_name.charAt(0) : "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">
                                        {user?.full_name || "Mon espace"}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {user?.email || "Chargement..."}
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                            </div>
                        </Link>

                        {/* ═══════════ SECTION GÉNÉRAL (Clients, Modèles...) ═══════════ */}
                        {generalItems.length > 0 && (
                            <div className="px-4 mt-6">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">
                                    Général
                                </p>
                                <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden divide-y divide-white/5">
                                    {generalItems.map((item, i) => (
                                        <Link
                                            key={i}
                                            href={item.href || "#"}
                                            onClick={close}
                                            className="flex items-center gap-3 p-3.5 active:bg-white/5 transition-colors"
                                        >
                                            <div className="p-2 rounded-md bg-white/5 text-slate-300 [&_svg]:h-4 [&_svg]:w-4">
                                                {item.icon}
                                            </div>
                                            <span className="flex-1 text-sm font-semibold text-slate-200">
                                                {item.title}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-slate-600" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══════════ SECTION COMPTE ═══════════ */}
                        <div className="px-4 mt-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">
                                Compte
                            </p>
                            <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden divide-y divide-white/5">
                                {ACCOUNT_ITEMS.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            onClick={close}
                                            className="flex items-center gap-3 p-3.5 active:bg-white/5 transition-colors"
                                        >
                                            <div className="p-2 rounded-md bg-white/5 text-slate-300">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-600" />
                                        </Link>
                                    )
                                })}

                                {/* Notifications */}
                                <button className="w-full flex items-center gap-3 p-3.5 active:bg-white/5 transition-colors text-left">
                                    <div className="p-2 rounded-md bg-white/5 text-slate-300 relative">
                                        <Bell className="h-4 w-4" />
                                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-600 rounded-full border-2 border-[#0a0a0a]" />
                                    </div>
                                    <span className="flex-1 text-sm font-semibold text-slate-200">
                                        Notifications
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-600" />
                                </button>

                                {/* Revoir le guide */}
                                <button
                                    onClick={() => { close(); setTimeout(startTour, 300); }}
                                    className="w-full flex items-center gap-3 p-3.5 active:bg-white/5 transition-colors text-left"
                                >
                                    <div className="p-2 rounded-md bg-white/5 text-slate-300">
                                        <HelpCircle className="h-4 w-4" />
                                    </div>
                                    <span className="flex-1 text-sm font-semibold text-slate-200">
                                        Revoir le guide
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-600" />
                                </button>
                            </div>
                        </div>

                        <div className="h-6" />
                    </ScrollArea>

                    {/* ═══════════ BAS : DÉCONNEXION ═══════════ */}
                    <div className="px-4 py-3 border-t border-white/5 shrink-0">
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center gap-2 h-12 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm active:scale-[0.98] transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                        <p className="text-center text-[10px] text-slate-600 mt-2">
                            Sharaco v1.0
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}