"use client"

import { useMemo, useState } from "react"
import {
    ChevronLeft,
    Eye,
    Loader2,
    Plus,
    Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { ProjectTreeInvoice, ProjectTreeQuote } from "../types"
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

const statusLabel: Record<string, { text: string; className: string }> = {
    DRAFT: { text: "Brouillon", className: "text-slate-500" },
    SENT: { text: "Envoyée", className: "text-slate-400" },
    VIEWED: { text: "Consultée", className: "text-slate-400" },
    PAID: { text: "Payée", className: "text-emerald-500" },
    OVERDUE: { text: "En retard", className: "text-rose-400" },
}

type FilterType = "all" | "paid" | "overdue" | "pending"

function invoiceDate(value?: string | null) {
    if (!value) return null
    return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function InvoiceGrid({ quote, onBack, onRefresh }: InvoiceGridProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<FilterType>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isGeneratingNext, setIsGeneratingNext] = useState(false)

    const totalQuoteAmount = quote.amount_cents || 0
    const totalInvoicedCents = useMemo(
        () => quote.invoices.reduce((acc, inv) => acc + (inv.amount_cents || 0), 0),
        [quote.invoices]
    )
    const totalPaidCents = useMemo(
        () => quote.invoices.filter((inv) => inv.status === "PAID").reduce((acc, inv) => acc + (inv.amount_cents || 0), 0),
        [quote.invoices]
    )
    const totalOverdueCents = useMemo(
        () => quote.invoices
            .filter((inv) => inv.status === "OVERDUE" || (inv.days_late && inv.days_late > 0))
            .reduce((acc, inv) => acc + (inv.amount_cents || 0), 0),
        [quote.invoices]
    )
    const totalPendingCents = useMemo(
        () => quote.invoices
            .filter((inv) => ["SENT", "VIEWED", "DRAFT"].includes(inv.status))
            .reduce((acc, inv) => acc + (inv.amount_cents || 0), 0),
        [quote.invoices]
    )

    const paidCount = quote.invoices.filter((i) => i.status === "PAID").length
    const overdueCount = quote.invoices.filter((i) => i.status === "OVERDUE" || (i.days_late && i.days_late > 0)).length
    const pendingCount = quote.invoices.length - paidCount - overdueCount

    const paidPercent = totalQuoteAmount > 0 ? Math.min(100, Math.round((totalPaidCents / totalQuoteAmount) * 100)) : 0
    const pendingPercent = totalQuoteAmount > 0
        ? Math.min(100 - paidPercent, Math.round((totalPendingCents / totalQuoteAmount) * 100))
        : 0

    const uninvoicedMilestonesCount = (quote.milestones || []).filter((m) => !m.invoice_id).length

    const filteredInvoices = useMemo(() => {
        return quote.invoices.filter((inv) => {
            if (filter === "paid" && inv.status !== "PAID") return false
            if (filter === "overdue" && !(inv.status === "OVERDUE" || (inv.days_late && inv.days_late > 0))) return false
            if (filter === "pending" && !["SENT", "VIEWED", "DRAFT"].includes(inv.status)) return false
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                return [inv.number, inv.milestone_title, inv.invoice_type]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(query))
            }
            return true
        })
    }, [quote.invoices, filter, searchQuery])

    const handleGenerateNextInvoice = async () => {
        if (quote.status !== "ACCEPTED") {
            toast.error("Le devis n’est pas encore accepté.", {
                action: {
                    label: "Ouvrir",
                    onClick: () => router.push(`/dashboard/quotes/${quote.id}`),
                },
            })
            return
        }

        setIsGeneratingNext(true)
        try {
            const res = await quotesApi.generateNextInvoice(quote.id)
            toast.success(`Facture ${res.invoice_number || ""} créée.`)
            onRefresh?.()
        } catch (error: unknown) {
            const rawMsg = error instanceof Error ? error.message : ""
            toast.error(rawMsg || "Impossible de générer la facture.")
        } finally {
            setIsGeneratingNext(false)
        }
    }

    const filters: Array<{ key: FilterType; label: string; count: number }> = [
        { key: "all", label: "Toutes", count: quote.invoices.length },
        { key: "paid", label: "Payées", count: paidCount },
        { key: "pending", label: "En attente", count: pendingCount },
        { key: "overdue", label: "En retard", count: overdueCount },
    ]

    return (
        <div className="space-y-8">
            {quote.status !== "ACCEPTED" && (
                <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-300">
                        Ce devis n’est pas encore accepté. Les factures d’échéance ne peuvent pas être émises.
                    </p>
                    <Link
                        href={`/dashboard/quotes/${quote.id}`}
                        className="text-sm font-medium text-slate-200 underline-offset-4 hover:underline"
                    >
                        Ouvrir le devis
                    </Link>
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={onBack}
                        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-200"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Devis du projet
                    </button>
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                        Factures · {quote.number || "sans numéro"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {quote.invoices.length} facture{quote.invoices.length > 1 ? "s" : ""}
                        {uninvoicedMilestonesCount > 0
                            ? ` · ${uninvoicedMilestonesCount} échéance${uninvoicedMilestonesCount > 1 ? "s" : ""} restante${uninvoicedMilestonesCount > 1 ? "s" : ""}`
                            : ""}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {uninvoicedMilestonesCount > 0 && (
                        <Button
                            onClick={handleGenerateNextInvoice}
                            disabled={isGeneratingNext}
                            className="h-9 gap-2 rounded-md bg-white px-3 text-xs font-medium text-zinc-950 hover:bg-zinc-200"
                        >
                            {isGeneratingNext ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            Prochaine facture
                        </Button>
                    )}
                    <Link href={`/dashboard/quotes/${quote.id}`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 rounded-md border-white/10 bg-transparent px-3 text-xs font-medium text-slate-300 hover:bg-white/5"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Devis
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm">
                    <div>
                        <span className="text-slate-500">Devisé </span>
                        <span className="font-medium text-white">{formatCurrency(totalQuoteAmount)}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Émis </span>
                        <span className="font-medium text-white">{formatCurrency(totalInvoicedCents)}</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Encaissé </span>
                        <span className="font-medium text-emerald-400">{formatCurrency(totalPaidCents)}</span>
                    </div>
                    {overdueCount > 0 ? (
                        <div>
                            <span className="text-slate-500">En retard </span>
                            <span className="font-medium text-rose-400">{formatCurrency(totalOverdueCents)}</span>
                        </div>
                    ) : (
                        <div>
                            <span className="text-slate-500">En attente </span>
                            <span className="font-medium text-white">{formatCurrency(totalPendingCents)}</span>
                        </div>
                    )}
                </div>
                <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-emerald-500" style={{ width: `${paidPercent}%` }} />
                    <div className="h-full bg-white/35" style={{ width: `${pendingPercent}%` }} />
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1">
                    {filters.map((btn) => (
                        <button
                            key={btn.key}
                            type="button"
                            onClick={() => setFilter(btn.key)}
                            className={cn(
                                "rounded-md px-2.5 py-1.5 text-xs transition-colors",
                                filter === btn.key
                                    ? "bg-white/10 text-white"
                                    : "text-slate-500 hover:text-slate-200",
                                btn.key === "overdue" && btn.count > 0 && filter !== btn.key && "text-rose-400/80"
                            )}
                        >
                            {btn.label}
                            <span className="ml-1.5 tabular-nums text-slate-500">{btn.count}</span>
                        </button>
                    ))}
                </div>
                <div className="relative sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-9 w-full rounded-md border border-white/10 bg-transparent pl-8 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-white/20 focus:outline-none"
                    />
                </div>
            </div>

            {filteredInvoices.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-sm font-medium text-white">Aucune facture ici</p>
                    <p className="mt-1 text-sm text-slate-500">
                        {searchQuery ? `Rien pour « ${searchQuery} ».` : "Change de filtre, ou génère la prochaine échéance."}
                    </p>
                    {uninvoicedMilestonesCount > 0 && (
                        <Button
                            onClick={handleGenerateNextInvoice}
                            disabled={isGeneratingNext}
                            className="mt-5 h-9 gap-2 rounded-md bg-white px-3 text-xs font-medium text-zinc-950 hover:bg-zinc-200"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Prochaine facture
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                    {filteredInvoices.map((invoice) => (
                        <InvoiceCard key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}
        </div>
    )
}

function InvoiceCard({ invoice }: { invoice: ProjectTreeInvoice }) {
    const status = statusLabel[invoice.status] || statusLabel.DRAFT
    const isOverdue = invoice.status === "OVERDUE" || (invoice.days_late && invoice.days_late > 0)
    const due = invoiceDate(invoice.due_date)
    const issued = invoiceDate(invoice.issued_at)

    return (
        <Link href={`/dashboard/invoices/${invoice.id}`} className="group flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-white/10 bg-zinc-950 transition-[border-color,transform] duration-150 ease-out group-hover:-translate-y-0.5 group-hover:border-white/20 group-active:scale-[0.99]">
                <DocumentPreview documentId={invoice.id} layoutStyle="modern" />
                {isOverdue && invoice.status !== "PAID" && (
                    <span className="absolute left-2 top-2 rounded bg-zinc-950/85 px-1.5 py-0.5 text-[10px] font-medium text-rose-300">
                        {invoice.days_late && invoice.days_late > 0 ? `${invoice.days_late} j de retard` : "En retard"}
                    </span>
                )}
            </div>
            <div className="mt-2.5 px-0.5">
                <div className="flex items-baseline justify-between gap-2">
                    <h4 className="truncate text-sm font-medium text-white">
                        {invoice.number || "Sans numéro"}
                    </h4>
                    <span className="shrink-0 text-sm tabular-nums text-slate-200">
                        {formatCurrency(invoice.amount_cents)}
                    </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="truncate">
                        {invoice.milestone_title
                            || (invoice.status === "PAID" && issued ? `Payée · ${issued}` : due ? `Échéance ${due}` : issued ? `Émise ${issued}` : "Facture")}
                    </span>
                    <span className={cn("shrink-0", status.className)}>{status.text}</span>
                </div>
            </div>
        </Link>
    )
}
