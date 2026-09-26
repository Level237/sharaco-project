// features/projects/components/InvoiceGrid.tsx
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ChevronLeft, 
    CheckCircle2, 
    AlertTriangle, 
    Clock, 
    FileText, 
    TrendingUp, 
    Wallet, 
    ArrowUpRight, 
    Eye, 
    Plus, 
    RefreshCw, 
    LayoutGrid, 
    List, 
    Search, 
    Calendar,
    Receipt,
    ShieldAlert,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { ProjectTreeQuote, ProjectTreeInvoice } from "../types"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface InvoiceGridProps {
    quote: ProjectTreeQuote;
    onBack: () => void;
    onRefresh?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; glow: string; icon: any }> = {
    DRAFT: { 
        label: "Brouillon", 
        color: "text-slate-400", 
        bg: "bg-slate-500/10", 
        border: "border-slate-500/20",
        glow: "from-slate-500/20 to-transparent",
        icon: FileText 
    },
    SENT: { 
        label: "Envoyée", 
        color: "text-sky-400", 
        bg: "bg-sky-500/10", 
        border: "border-sky-500/30",
        glow: "from-sky-500/20 to-transparent",
        icon: Clock 
    },
    VIEWED: { 
        label: "Consultée", 
        color: "text-blue-400", 
        bg: "bg-blue-500/10", 
        border: "border-blue-500/30",
        glow: "from-[#2563EB]/25 to-transparent",
        icon: Clock 
    },
    PAID: { 
        label: "Payée", 
        color: "text-emerald-400", 
        bg: "bg-emerald-500/10", 
        border: "border-emerald-500/30",
        glow: "from-emerald-500/20 to-transparent",
        icon: CheckCircle2 
    },
    OVERDUE: { 
        label: "En retard", 
        color: "text-rose-400", 
        bg: "bg-rose-500/10", 
        border: "border-rose-500/30",
        glow: "from-rose-500/25 to-transparent",
        icon: AlertTriangle 
    },
}

type FilterType = "all" | "paid" | "overdue" | "pending";

export function InvoiceGrid({ quote, onBack, onRefresh }: InvoiceGridProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isGeneratingNext, setIsGeneratingNext] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Calculs financiers consolidés
    const totalQuoteAmount = quote.amount_cents || 0;
    
    const totalInvoicedCents = useMemo(() => {
        return quote.invoices.reduce((acc, inv) => acc + (inv.amount_cents || 0), 0);
    }, [quote.invoices]);

    const totalPaidCents = useMemo(() => {
        return quote.invoices
            .filter(inv => inv.status === "PAID")
            .reduce((acc, inv) => acc + (inv.amount_cents || 0), 0);
    }, [quote.invoices]);

    const totalOverdueCents = useMemo(() => {
        return quote.invoices
            .filter(inv => inv.status === "OVERDUE" || (inv.days_late && inv.days_late > 0))
            .reduce((acc, inv) => acc + (inv.amount_cents || 0), 0);
    }, [quote.invoices]);

    const totalPendingCents = useMemo(() => {
        return quote.invoices
            .filter(inv => ["SENT", "VIEWED", "DRAFT"].includes(inv.status))
            .reduce((acc, inv) => acc + (inv.amount_cents || 0), 0);
    }, [quote.invoices]);

    const paidCount = quote.invoices.filter(i => i.status === "PAID").length;
    const overdueCount = quote.invoices.filter(i => i.status === "OVERDUE" || (i.days_late && i.days_late > 0)).length;
    const pendingCount = quote.invoices.length - paidCount - overdueCount;

    const invoicedPercent = totalQuoteAmount > 0 
        ? Math.min(100, Math.round((totalInvoicedCents / totalQuoteAmount) * 100)) 
        : 0;
    const paidPercent = totalQuoteAmount > 0 
        ? Math.min(100, Math.round((totalPaidCents / totalQuoteAmount) * 100)) 
        : 0;
    const pendingPercent = totalQuoteAmount > 0
        ? Math.min(100 - paidPercent, Math.round((totalPendingCents / totalQuoteAmount) * 100))
        : 0;

    // Vérifier les jalons non encore facturés
    const uninvoicedMilestonesCount = (quote.milestones || []).filter(m => !m.invoice_id).length;

    // Filtrage et recherche
    const filteredInvoices = useMemo(() => {
        return quote.invoices.filter(inv => {
            // Filtre par statut
            if (filter === "paid" && inv.status !== "PAID") return false;
            if (filter === "overdue" && !(inv.status === "OVERDUE" || (inv.days_late && inv.days_late > 0))) return false;
            if (filter === "pending" && !["SENT", "VIEWED", "DRAFT"].includes(inv.status)) return false;

            // Filtre par recherche texte
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const num = (inv.number || "").toLowerCase();
                const milestone = (inv.milestone_title || "").toLowerCase();
                const type = (inv.invoice_type || "").toLowerCase();
                return num.includes(query) || milestone.includes(query) || type.includes(query);
            }

            return true;
        });
    }, [quote.invoices, filter, searchQuery]);

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
            toast.success("Données actualisées");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleGenerateNextInvoice = async () => {
        if (quote.status !== "ACCEPTED") {
            toast.error("Validation du devis requise", {
                description: "Le devis doit d'abord être accepté/validé avant de pouvoir générer les factures d'échéances.",
                action: {
                    label: "Ouvrir le devis",
                    onClick: () => router.push(`/dashboard/quotes/${quote.id}`),
                },
                duration: 6000,
            });
            return;
        }

        setIsGeneratingNext(true);
        try {
            const res = await quotesApi.generateNextInvoice(quote.id);
            toast.success("Facture générée avec succès !", {
                description: `Facture ${res.invoice_number || ""} créée pour ${res.milestone_title || "le jalon"}.`,
            });
            if (onRefresh) onRefresh();
        } catch (error: any) {
            const rawMsg = error.message || error.detail || "";
            const lower = rawMsg.toLowerCase();

            if (lower.includes("antérieure") || lower.includes("antérieur") || lower.includes("traitée") || lower.includes("doit être payée") || lower.includes("doit d'abord être") || lower.includes("milestone") || lower.includes("échéance")) {
                toast.error("Facture antérieure non traitée", {
                    description: rawMsg || "La facture antérieure n'a pas encore été traitée. Elle doit être payée avant de facturer la suivante.",
                    duration: 6500,
                });
            } else if (lower.includes("accepté") || lower.includes("devis")) {
                toast.error("Validation du devis requise", {
                    description: "Le devis doit d'abord être accepté avant de pouvoir émettre les factures.",
                    action: {
                        label: "Voir le devis",
                        onClick: () => router.push(`/dashboard/quotes/${quote.id}`),
                    },
                    duration: 6500,
                });
            } else {
                toast.error("Impossible de générer la facture", {
                    description: rawMsg || "Une erreur est survenue lors de la génération.",
                });
            }
        } finally {
            setIsGeneratingNext(false);
        }
    };

    const filterButtons: Array<{ key: FilterType; label: string; count: number; color?: string }> = [
        { key: "all", label: "Toutes les factures", count: quote.invoices.length },
        { key: "paid", label: "Payées", count: paidCount },
        { key: "pending", label: "En attente", count: pendingCount },
        { key: "overdue", label: "En retard", count: overdueCount, color: "text-rose-400" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="space-y-8"
        >
            {/* Bannière contextuelle si le devis n'est pas encore accepté */}
            {quote.status !== "ACCEPTED" && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 shadow-lg">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="text-xs">
                            <span className="font-bold text-white block text-sm">Devis en attente de validation ({quote.status})</span>
                            <span className="text-amber-200/80">Pour pouvoir émettre automatiquement les factures d'échéances, vous devez d'abord valider/accepter ce devis.</span>
                        </div>
                    </div>
                    <Link href={`/dashboard/quotes/${quote.id}`}>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-8 px-3.5 rounded-xl shrink-0 gap-1.5 shadow-md">
                            <span>Valider le devis</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            )}
            {/* ═══════════════════════════════════════════════════════════
                1. HEADER & ACTIONS
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={onBack}
                        className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] w-fit shadow-sm"
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 text-[#2563EB]" />
                        <span>Retour aux devis du projet</span>
                    </button>

                    <div className="h-5 w-px bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shadow-inner">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Facturation du devis
                                </span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/30">
                                    {quote.number || "Sans numéro"}
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                                Factures & Échéances
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    {uninvoicedMilestonesCount > 0 && (
                        <Button
                            onClick={handleGenerateNextInvoice}
                            disabled={isGeneratingNext}
                            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs h-9 px-3.5 rounded-xl gap-2 shadow-lg shadow-[#2563EB]/25 hover:shadow-[#2563EB]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                            {isGeneratingNext ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Plus className="w-3.5 h-3.5" />
                            )}
                            <span>Générer prochaine facture ({uninvoicedMilestonesCount} restante{uninvoicedMilestonesCount > 1 ? "s" : ""})</span>
                        </Button>
                    )}

                    <Link href={`/dashboard/quotes/${quote.id}`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-bold h-9 px-3 rounded-xl border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 gap-1.5"
                        >
                            <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Voir le devis</span>
                        </Button>
                    </Link>

                    {onRefresh && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="h-9 w-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                            title="Actualiser les données"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                        </Button>
                    )}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                2. VIGNETTE DU DEVIS D'ORIGINE (APERÇU DOCUMENT)
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#14171d]/90 backdrop-blur-xl border border-white/10 shadow-lg gap-4">
                <div className="flex items-center gap-4">
                    {/* Miniature du devis */}
                    <div className="w-16 h-22 sm:w-20 sm:h-26 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 relative shadow-md ring-1 ring-white/10">
                        <DocumentPreview documentId={quote.id} layoutStyle="modern" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                Devis source
                            </span>
                            <span className="text-xs font-bold text-[#2563EB]">
                                #{quote.number || "Sans numéro"}
                            </span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                            {formatCurrency(totalQuoteAmount)}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                            Établi le {new Date(quote.created_at).toLocaleDateString('fr-FR')} • {quote.invoices.length} facture{quote.invoices.length > 1 ? "s" : ""} liée{quote.invoices.length > 1 ? "s" : ""}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                    <Link href={`/dashboard/quotes/${quote.id}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-bold h-9 px-3 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white gap-1.5"
                        >
                            <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>Détail du devis source</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                3. FINANCIAL KPI CARDS & PROGRESSION BAR
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* Carte 1: Total Devisé */}
                    <div className="relative p-5 rounded-2xl bg-[#1a1e26]/80 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden group hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                            <span>Devis contractuel</span>
                            <div className="p-1.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white tracking-tight">
                            {formatCurrency(totalQuoteAmount)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                            <span>Base totale négociée</span>
                        </div>
                    </div>

                    {/* Carte 2: Total Facturé */}
                    <div className="relative p-5 rounded-2xl bg-[#1a1e26]/80 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden group hover:border-white/20 transition-all">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                            <span>Total émis</span>
                            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white tracking-tight">
                            {formatCurrency(totalInvoicedCents)}
                        </div>
                        <div className="text-xs text-sky-400 font-semibold mt-1">
                            {invoicedPercent}% du montant devisé
                        </div>
                    </div>

                    {/* Carte 3: Total Encaissé */}
                    <div className="relative p-5 rounded-2xl bg-emerald-950/20 backdrop-blur-xl border border-emerald-500/20 shadow-lg overflow-hidden group hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center justify-between text-xs font-semibold text-emerald-300/80 mb-2">
                            <span>Total encaissé</span>
                            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-400 tracking-tight">
                            {formatCurrency(totalPaidCents)}
                        </div>
                        <div className="text-xs text-emerald-300/80 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{paidCount} facture{paidCount > 1 ? "s" : ""} payée{paidCount > 1 ? "s" : ""} ({paidPercent}%)</span>
                        </div>
                    </div>

                    {/* Carte 4: En retard ou En attente */}
                    {overdueCount > 0 ? (
                        <div className="relative p-5 rounded-2xl bg-rose-950/20 backdrop-blur-xl border border-rose-500/30 shadow-lg overflow-hidden group hover:border-rose-500/50 transition-all">
                            <div className="flex items-center justify-between text-xs font-semibold text-rose-300/80 mb-2">
                                <span>Factures en retard</span>
                                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 animate-pulse">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-rose-400 tracking-tight">
                                {formatCurrency(totalOverdueCents)}
                            </div>
                            <div className="text-xs text-rose-300/80 font-bold mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                <span>{overdueCount} facture{overdueCount > 1 ? "s" : ""} à relancer d'urgence</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative p-5 rounded-2xl bg-[#1a1e26]/80 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden group hover:border-white/20 transition-all">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                                <span>En attente de paiement</span>
                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tight">
                                {formatCurrency(totalPendingCents)}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                {pendingCount} facture{pendingCount > 1 ? "s" : ""} en cours d'échéance
                            </div>
                        </div>
                    )}
                </div>

                {/* Barre de progression segmentée */}
                <div className="p-4 rounded-2xl bg-[#14171d]/90 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-2">
                            <span>Avancement de la facturation</span>
                            <span className="text-white font-bold">{invoicedPercent}% facturé</span>
                        </span>
                        <div className="flex items-center gap-3 text-[11px]">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Encaissé ({paidPercent}%)</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                                <span>En attente ({pendingPercent}%)</span>
                            </span>
                            {invoicedPercent < 100 && (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                                    <span>Restant ({100 - invoicedPercent}%)</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${paidPercent}%` }}
                            title={`Encaissé : ${formatCurrency(totalPaidCents)}`}
                        />
                        <div 
                            className="h-full bg-[#2563EB] transition-all duration-500"
                            style={{ width: `${pendingPercent}%` }}
                            title={`En attente : ${formatCurrency(totalPendingCents)}`}
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                4. TOOLBAR : FILTRES, RECHERCHE & SWITCH VIEW
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                {/* Boutons filtres */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {filterButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setFilter(btn.key)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                                filter === btn.key
                                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-[#2563EB]/25"
                                    : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
                            )}
                        >
                            <span className={btn.color}>{btn.label}</span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.2 rounded-full font-black",
                                filter === btn.key
                                    ? "bg-white/20 text-white"
                                    : "bg-white/10 text-slate-400"
                            )}>
                                {btn.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Recherche & Toggle Grille/Liste */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher une facture..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                            )}
                            title="Vue en grille"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                            )}
                            title="Vue en liste"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                5. AFFICHAGE DES FACTURES
            ═══════════════════════════════════════════════════════════ */}
            {filteredInvoices.length === 0 ? (
                <div className="py-20 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10 p-8 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                        Aucune facture trouvée
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mb-5">
                        {searchQuery
                            ? `Aucun résultat ne correspond à la recherche "${searchQuery}".`
                            : "Aucune facture n'est associée à ce filtre pour le moment."}
                    </p>
                    {uninvoicedMilestonesCount > 0 && (
                        <Button
                            onClick={handleGenerateNextInvoice}
                            disabled={isGeneratingNext}
                            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs h-9 px-4 rounded-xl gap-2 shadow-lg shadow-[#2563EB]/25"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Générer la prochaine facture
                        </Button>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-8">
                    <AnimatePresence mode="popLayout">
                        {filteredInvoices.map((invoice) => (
                            <InvoiceImpactCard key={invoice.id} invoice={invoice} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="rounded-2xl border border-white/10 bg-[#161920]/90 backdrop-blur-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-white/10">
                                <tr>
                                    <th className="py-3.5 px-4">Numéro</th>
                                    <th className="py-3.5 px-4">Jalon / Type</th>
                                    <th className="py-3.5 px-4">Émission</th>
                                    <th className="py-3.5 px-4">Échéance</th>
                                    <th className="py-3.5 px-4 text-right">Montant</th>
                                    <th className="py-3.5 px-4 text-center">Statut</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium text-slate-300">
                                {filteredInvoices.map((invoice) => {
                                    const config = statusConfig[invoice.status] || statusConfig.DRAFT;
                                    const StatusIcon = config.icon;
                                    const isOverdue = invoice.status === "OVERDUE" || (invoice.days_late && invoice.days_late > 0);

                                    return (
                                        <tr key={invoice.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isOverdue ? "bg-rose-500" : invoice.status === "PAID" ? "bg-emerald-500" : "bg-[#2563EB]")} />
                                                <span className="group-hover:text-[#2563EB] transition-colors">
                                                    {invoice.number || "Sans numéro"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="truncate max-w-[200px]">
                                                    {invoice.milestone_title || (invoice.invoice_type ? `Facture ${invoice.invoice_type.toLowerCase()}` : "Facture standard")}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-400">
                                                {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString('fr-FR') : "—"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {invoice.due_date ? (
                                                    <span className={cn(isOverdue && invoice.status !== "PAID" ? "text-rose-400 font-bold" : "text-slate-400")}>
                                                        {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                                                        {isOverdue && invoice.days_late && invoice.days_late > 0 && (
                                                            <span className="ml-1 text-[10px] bg-rose-500/20 text-rose-400 px-1 py-0.5 rounded">
                                                                +{invoice.days_late}j
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="py-3.5 px-4 text-right font-black text-white">
                                                {formatCurrency(invoice.amount_cents)}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border",
                                                    config.bg, config.color, config.border
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    <span>{config.label}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <Link href={`/dashboard/invoices/${invoice.id}`}>
                                                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 gap-1 rounded-lg">
                                                        <span>Détail</span>
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════
// CARTE FACTURE IMPACTANTE AVEC PRÉVISUALISATION VISUELLE DU DOCUMENT
// ═══════════════════════════════════════════════════════════
function InvoiceImpactCard({ invoice }: { invoice: ProjectTreeInvoice }) {
    const config = statusConfig[invoice.status] || statusConfig.DRAFT;
    const StatusIcon = config.icon;
    const isOverdue = invoice.status === "OVERDUE" || (invoice.days_late && invoice.days_late > 0);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="group flex flex-col"
        >
            <div className={cn(
                "relative w-full aspect-[4/5] rounded-2xl p-2 transition-all duration-300 overflow-hidden",
                "bg-slate-100/50 dark:bg-white/[0.02] border flex flex-col justify-between",
                "group-hover:-translate-y-1 group-hover:shadow-2xl shadow-lg",
                isOverdue
                    ? "border-rose-500/30 group-hover:border-rose-500/60 group-hover:shadow-rose-500/10"
                    : "border-slate-200/50 dark:border-white/5 group-hover:border-[#2563EB]/60 group-hover:shadow-[#2563EB]/15"
            )}>
                {/* ══════════════════════════════════════════════════════
                    PRÉVISUALISATION RÉELLE DU DOCUMENT (IMAGE PNG)
                ══════════════════════════════════════════════════════ */}
                <div className="w-full h-full rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-950/50 relative">
                    <DocumentPreview
                        documentId={invoice.id}
                        layoutStyle="modern"
                    />

                    {/* Badge statut en haut à droite */}
                    <div className="absolute top-2.5 right-2.5 z-20">
                        <div className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shadow-lg backdrop-blur-md",
                            config.bg, config.color, config.border
                        )}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{config.label}</span>
                        </div>
                    </div>

                    {/* Badge type de facture en haut à gauche */}
                    <div className="absolute top-2.5 left-2.5 z-20">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md border border-white/10 text-white shadow-md">
                            {invoice.invoice_type || "Facture"}
                        </span>
                    </div>

                    {/* Titre milestone si associé */}
                    {invoice.milestone_title && (
                        <div className="absolute bottom-2.5 left-2.5 z-20 max-w-[85%]">
                            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#14171d]/90 backdrop-blur-md border border-white/15 text-slate-200 truncate block shadow-md">
                                {invoice.milestone_title}
                            </span>
                        </div>
                    )}

                    {/* Hover Overlay avec bouton d'accès rapide */}
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-30">
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Button size="sm" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold rounded-xl h-10 px-4 shadow-xl gap-2 hover:scale-105 transition-transform">
                                <Eye className="w-4 h-4" />
                                <span>Consulter la facture</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Détails textuels sous la carte */}
            <div className="mt-3 px-1">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-[#2563EB] transition-colors">
                        {invoice.number || "Facture sans numéro"}
                    </h4>
                    <span className="text-sm font-black text-slate-900 dark:text-white shrink-0">
                        {formatCurrency(invoice.amount_cents)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {invoice.due_date && invoice.status !== "PAID" ? (
                        <span className={cn(isOverdue ? "text-rose-500 dark:text-rose-400 font-bold" : "text-slate-500 dark:text-slate-400")}>
                            Échéance {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                            {isOverdue && invoice.days_late && invoice.days_late > 0 && (
                                <span className="ml-1 text-[10px] font-black text-rose-500 dark:text-rose-400">
                                    (+{invoice.days_late}j)
                                </span>
                            )}
                        </span>
                    ) : invoice.issued_at ? (
                        <span>Émise le {new Date(invoice.issued_at).toLocaleDateString('fr-FR')}</span>
                    ) : (
                        <span>Facture standard</span>
                    )}

                    <span className={cn("text-[10px] font-bold uppercase", config.color)}>
                        {config.label}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}