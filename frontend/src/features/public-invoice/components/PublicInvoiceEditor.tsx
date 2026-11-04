"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Check,
    Download,
    Eye,
    Link2,
    Loader2,
    Mail,
    Plus,
    Printer,
    Trash2,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Logo from "@/components/ui/logo"
import { useAuthStore } from "@/store/auth-store"
import { invoicesApi } from "@/features/invoices/api/invoicesApi"
import { setAfterAuthPath } from "@/features/auth/lib/afterAuth"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import { settingsApi } from "@/features/settings/api/settingsApi"
import { accountPatchForDraft } from "../fromAccount"
import { PUBLIC_INVOICE_PATH } from "../paths"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { CURRENCY_LABELS } from "@/lib/currency"
import { emptyPublicInvoiceLine, type InvoiceTerms } from "../types"
import { usePublicInvoiceDraft } from "../hooks/usePublicInvoiceDraft"
import { clearPublicInvoiceDraft } from "../storage"
import {
    computeDraftTotals,
    savePublicInvoiceDraft,
    validatePublicInvoiceDraft,
} from "../api"
import { PublicInvoicePreview } from "./PublicInvoicePreview"
import { SignaturePad } from "./SignaturePad"

interface PublicInvoiceEditorProps {
    mode: "public" | "app"
}

const BRAND_SWATCHES = [
    { label: "Bleu Sharaco", value: "#2563EB" },
    { label: "Indigo", value: "#4F46E5" },
    { label: "Violet", value: "#7C3AED" },
    { label: "Émeraude", value: "#059669" },
    { label: "Ardoise", value: "#334155" },
    { label: "Ambre", value: "#D97706" },
    { label: "Rose", value: "#E11D48" },
]

function addDays(isoDate: string, days: number): string {
    const base = isoDate ? new Date(`${isoDate}T12:00:00`) : new Date()
    if (Number.isNaN(base.getTime())) return new Date().toISOString().split("T")[0]
    base.setDate(base.getDate() + days)
    return base.toISOString().split("T")[0]
}

function formatMoney(amount: number, currency: string): string {
    return formatCurrency(amount || 0, currency)
}

function currencyOptionLabel(code: string): string {
    const label = (CURRENCY_LABELS[code] || code).replace(" — ", " · ")
    return `${code} · ${label}`
}

const FIELD =
    "h-9 rounded-md border border-white/10 bg-[#131722] text-xs text-white placeholder:text-slate-500 shadow-none hover:shadow-none focus:border-[#2563EB] focus:outline-none focus:ring-0 focus:shadow-none backdrop-blur-none"

export function PublicInvoiceEditor({ mode }: PublicInvoiceEditorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const setUser = useAuthStore((state) => state.setUser)
    const { data: profile } = useCurrentUser()
    const storeUser = useAuthStore((state) => state.user)
    const user = profile || storeUser
    const { draft, setDraft, update, clear, hydrated } = usePublicInvoiceDraft()
    const seededAccount = useRef(false)

    const [activeView, setActiveView] = useState<"edit" | "preview">("edit")
    const [showExtraFrom, setShowExtraFrom] = useState(false)
    const [previewEmail, setPreviewEmail] = useState("")
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)
    const claiming = useRef(false)

    useEffect(() => {
        document.documentElement.classList.add("dark")
    }, [])

    useEffect(() => {
        if (!hydrated || !user || seededAccount.current) return
        seededAccount.current = true
        const patch = accountPatchForDraft(draft, user)
        if (Object.keys(patch).length > 0) update(patch)
    }, [hydrated, user, draft, update])

    useEffect(() => {
        if (!isAuthenticated || !hydrated || !draft.signatureImage) return
        if (user?.signature_image) return
        let cancelled = false
        const timer = window.setTimeout(() => {
            void settingsApi
                .updateProfile({ signature_image: draft.signatureImage })
                .then((updated) => {
                    if (!cancelled) setUser(updated)
                })
                .catch(() => {
                    // profil non bloquant
                })
        }, 400)
        return () => {
            cancelled = true
            window.clearTimeout(timer)
        }
    }, [isAuthenticated, hydrated, draft.signatureImage, user?.signature_image, setUser])

    useEffect(() => {
        if (!previewEmail && (draft.clientEmail || draft.issuerEmail)) {
            setPreviewEmail(draft.clientEmail || draft.issuerEmail)
        }
    }, [draft.clientEmail, draft.issuerEmail, previewEmail])

    const persistInvoice = async (intent: "download" | "save") => {
        const message = validatePublicInvoiceDraft(draft)
        if (message) {
            setError(message)
            setActiveView("edit")
            return
        }
        if (!isAuthenticated) {
            const next = `${PUBLIC_INVOICE_PATH}?intent=${intent}`
            setAfterAuthPath(next)
            router.push(`/register?next=${encodeURIComponent(next)}`)
            return
        }
        setBusy(true)
        setError("")
        try {
            const id = await savePublicInvoiceDraft(draft)
            clearPublicInvoiceDraft()
            if (intent === "download") {
                await invoicesApi.downloadPdf(id, `${draft.number || "facture"}.pdf`)
            }
            router.push(`/dashboard/invoices/${id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Impossible d'enregistrer la facture.")
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        const intent = searchParams.get("intent")
        if (!isAuthenticated) return
        if (intent !== "download" && intent !== "save") return
        if (claiming.current) return
        if (typeof window !== "undefined" && sessionStorage.getItem("sharaco_claiming_invoice")) return
        claiming.current = true
        try {
            sessionStorage.setItem("sharaco_claiming_invoice", "1")
        } catch {
            // ignore
        }
        void persistInvoice(intent).finally(() => {
            try {
                sessionStorage.removeItem("sharaco_claiming_invoice")
            } catch {
                // ignore
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, searchParams])

    const handleTermsChange = (terms: InvoiceTerms) => {
        const days =
            terms === "net7" ? 7 : terms === "net15" ? 15 : terms === "net30" ? 30 : 0
        update({
            terms,
            dueDate: addDays(draft.issueDate, days),
        })
    }

    const handleIssueDateChange = (issueDate: string) => {
        const days =
            draft.terms === "net7"
                ? 7
                : draft.terms === "net15"
                ? 15
                : draft.terms === "net30"
                ? 30
                : 0
        update({
            issueDate,
            dueDate: addDays(issueDate, days),
        })
    }

    const setItem = (id: string, patch: Partial<(typeof draft.items)[number]>) => {
        setDraft((prev) => ({
            ...prev,
            items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        }))
    }

    const totals = computeDraftTotals(draft)
    const accentColor = draft.brandColor || "#2563EB"
    const signedIn = Boolean(isAuthenticated && user)

    return (
        <div className="min-h-[100dvh] bg-[#07090E] text-slate-100">
            {/* ═══════════ BARRE SUPÉRIEURE SHARACO ═══════════ */}
            <header className="border-b border-white/[0.07] bg-[#0B0E16]/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-[1260px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href={mode === "app" ? "/dashboard/invoices" : "/"}
                            className="flex items-center"
                        >
                            <Logo width={118} height={36} />
                        </Link>
                        <span className="hidden rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300 sm:inline">
                            Facture directe
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                        {signedIn ? (
                            <Link
                                href="/dashboard/invoices"
                                className="rounded-md border border-white/10 px-3 py-1.5 font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
                            >
                                Mes factures
                            </Link>
                        ) : (
                            <>
                               
                                <Link
                                    href={`/register?next=${encodeURIComponent(PUBLIC_INVOICE_PATH)}`}
                                    className="rounded-md bg-[#2563EB] px-3.5 py-1.5 font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                                >
                                    Créer un compte
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1260px] px-3 py-6 pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 lg:pb-8">
                {error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-rose-300 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_270px]">
                    {/* ═══════════════════════════════════════════════════════════
                        COLONNE GAUCHE — FEUILLE DE FACTURE (STYLE INVOICESIMPLE)
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="min-w-0">
                        {/* Barre d'onglets & actions au-dessus de la feuille (desktop) */}
                        <div className="mb-3 hidden flex-wrap items-center justify-between gap-2 lg:flex">
                            <div className="inline-flex overflow-hidden rounded-md border border-white/10 bg-[#111520] p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveView("preview")}
                                    className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                                        activeView === "preview"
                                            ? "rounded-[5px] bg-[#2563EB] text-white"
                                            : "text-slate-300 hover:text-white"
                                    }`}
                                >
                                    Aperçu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveView("edit")}
                                    className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                                        activeView === "edit"
                                            ? "rounded-[5px] bg-white/10 text-white"
                                            : "text-slate-300 hover:text-white"
                                    }`}
                                >
                                    Éditer
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() => void persistInvoice("download")}
                                    className="h-8 border-white/10 bg-[#111520] px-3.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
                                >
                                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "PDF"}
                                </Button>
                                <Button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void persistInvoice("save")}
                                    className="h-8 bg-[#2563EB] px-3.5 text-xs font-semibold text-white hover:bg-[#1d4ed8]"
                                >
                                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                                    Envoyer la facture
                                </Button>
                            </div>
                        </div>

                        {activeView === "preview" ? (
                            <div className="rounded-lg border border-white/10 bg-[#0D1017] p-3 sm:p-6">
                                <PublicInvoicePreview draft={draft} variant="full" />
                            </div>
                        ) : (
                            /* ═══════════ FEUILLE D'ÉDITION ═══════════ */
                            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0D1017] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
                                {/* Liseré de couleur en haut de la feuille */}
                                <div
                                    className="h-1.5 w-full"
                                    style={{ backgroundColor: accentColor }}
                                />

                                <div className="space-y-7 p-5 sm:p-8">
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-white">
                                            Facture
                                        </h1>
                                    </div>

                                    {/* De (From) & Facturé à (Bill To) */}
                                    <div className="grid grid-cols-1 gap-7 border-b border-white/[0.07] pb-7 md:grid-cols-2 md:gap-8">
                                        {/* DE */}
                                        <div className="space-y-2.5">
                                            <h2 className="mb-3 text-sm font-bold text-slate-200">
                                                De
                                            </h2>
                                            <InlineField
                                                label="Nom"
                                                placeholder="Nom de votre entreprise"
                                                value={draft.issuerName}
                                                onChange={(v) => update({ issuerName: v })}
                                            />
                                            <InlineField
                                                label="Email"
                                                type="email"
                                                placeholder="contact@entreprise.com"
                                                value={draft.issuerEmail}
                                                onChange={(v) => update({ issuerEmail: v })}
                                            />
                                            <InlineField
                                                label="Adresse"
                                                placeholder="Rue / Quartier"
                                                value={draft.issuerAddress}
                                                onChange={(v) => update({ issuerAddress: v })}
                                            />
                                            <InlineField
                                                label=""
                                                placeholder="Ville, Pays"
                                                value={draft.issuerCity}
                                                onChange={(v) => update({ issuerCity: v })}
                                            />
                                            <InlineField
                                                label="Téléphone"
                                                placeholder="+237 6..."
                                                value={draft.issuerPhone}
                                                onChange={(v) => update({ issuerPhone: v })}
                                            />
                                            {(showExtraFrom || draft.issuerTaxId) && (
                                                <InlineField
                                                    label="N° Entreprise"
                                                    placeholder="NIU / RCCM / SIRET"
                                                    value={draft.issuerTaxId}
                                                    onChange={(v) => update({ issuerTaxId: v })}
                                                />
                                            )}
                                            <div className="pt-1 sm:pl-[92px]">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowExtraFrom((prev) => !prev)}
                                                    className="text-[11px] font-medium text-[#2563EB] underline-offset-2 hover:underline"
                                                >
                                                    {showExtraFrom
                                                        ? "Masquer les détails entreprise"
                                                        : "Afficher plus de détails entreprise"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* FACTURÉ À */}
                                        <div className="space-y-2.5">
                                            <h2 className="mb-3 text-sm font-bold text-slate-200">
                                                Facturé à
                                            </h2>
                                            <InlineField
                                                label="Nom"
                                                placeholder="Nom du client"
                                                value={draft.clientName}
                                                clearable={Boolean(draft.clientName)}
                                                onClear={() => update({ clientName: "" })}
                                                onChange={(v) => update({ clientName: v })}
                                            />
                                            <InlineField
                                                label="Email"
                                                type="email"
                                                placeholder="client@email.com"
                                                value={draft.clientEmail}
                                                onChange={(v) => update({ clientEmail: v })}
                                            />
                                            <InlineField
                                                label="Adresse"
                                                placeholder="Quartier / Rue"
                                                value={draft.clientAddress}
                                                onChange={(v) => update({ clientAddress: v })}
                                            />
                                            <InlineField
                                                label=""
                                                placeholder="Ville"
                                                value={draft.clientCity}
                                                onChange={(v) => update({ clientCity: v })}
                                            />
                                            <InlineField
                                                label="Téléphone"
                                                placeholder="+237 6..."
                                                value={draft.clientPhone}
                                                onChange={(v) => update({ clientPhone: v })}
                                            />
                                            <InlineField
                                                label="Mobile"
                                                placeholder="Téléphone secondaire"
                                                value={draft.clientMobile}
                                                onChange={(v) => update({ clientMobile: v })}
                                            />
                                        </div>
                                    </div>

                                    {/* Numéro / Date / Conditions */}
                                    <div className="grid grid-cols-1 gap-4 sm:max-w-[360px]">
                                        <InlineField
                                            label="Numéro"
                                            placeholder="FAC-0001"
                                            value={draft.number}
                                            onChange={(v) => update({ number: v })}
                                        />
                                        <InlineField
                                            label="Date"
                                            type="date"
                                            value={draft.issueDate}
                                            onChange={handleIssueDateChange}
                                        />
                                        <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[84px_1fr] sm:gap-2">
                                            <span className="text-xs font-medium text-slate-400">
                                                Conditions
                                            </span>
                                            <select
                                                value={draft.terms}
                                                onChange={(e) =>
                                                    handleTermsChange(e.target.value as InvoiceTerms)
                                                }
                                                className="h-9 w-full rounded-md border border-white/10 bg-[#131722] px-3 text-xs font-medium text-slate-100 focus:border-[#2563EB] focus:outline-none"
                                            >
                                                <option value="receipt">À réception</option>
                                                <option value="net7">Sous 7 jours</option>
                                                <option value="net15">Sous 15 jours</option>
                                                <option value="net30">Sous 30 jours</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* ═══════════ TABLEAU DES LIGNES ═══════════ */}
                                    <div className="space-y-3">
                                        <div className="hidden grid-cols-[34px_minmax(0,1fr)_120px_76px_130px_42px] items-center gap-2.5 border-y border-white/15 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
                                            <span />
                                            <span>Description</span>
                                            <span className="text-right">Prix</span>
                                            <span className="text-right">Qté</span>
                                            <span className="text-right">Montant</span>
                                            <span className="text-center">Taxe</span>
                                        </div>

                                        <div className="divide-y divide-dashed divide-white/10">
                                            {draft.items.map((item, index) => {
                                                const lineTotal =
                                                    Math.max(0, Number(item.unitPrice) || 0) *
                                                    Math.max(1, Number(item.quantity) || 1)
                                                return (
                                                    <div key={item.id} className="py-3.5 first:pt-1">
                                                        <div className="mb-2.5 flex items-center justify-between sm:hidden">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                                Ligne {index + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                disabled={draft.items.length === 1}
                                                                onClick={() =>
                                                                    setDraft((prev) => ({
                                                                        ...prev,
                                                                        items: prev.items.filter(
                                                                            (row) => row.id !== item.id
                                                                        ),
                                                                    }))
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#131722] text-slate-400 disabled:opacity-40"
                                                                aria-label="Supprimer la ligne"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-[34px_minmax(0,1fr)_120px_76px_130px_42px]">
                                                            <button
                                                                type="button"
                                                                disabled={draft.items.length === 1}
                                                                onClick={() =>
                                                                    setDraft((prev) => ({
                                                                        ...prev,
                                                                        items: prev.items.filter(
                                                                            (row) => row.id !== item.id
                                                                        ),
                                                                    }))
                                                                }
                                                                className="hidden h-9 w-8 items-center justify-center rounded border border-white/10 bg-[#131722] text-slate-400 transition-colors hover:border-rose-500/40 hover:text-rose-400 disabled:opacity-40 sm:flex"
                                                                aria-label="Supprimer la ligne"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>

                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                                                    Description
                                                                </label>
                                                                <Input
                                                                    value={item.description}
                                                                    placeholder="Désignation de la prestation (ex. Conception Phase 1)"
                                                                    className={`${FIELD} font-medium`}
                                                                    onChange={(e) =>
                                                                        setItem(item.id, {
                                                                            description: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                                <div className="relative">
                                                                    <textarea
                                                                        rows={2}
                                                                        maxLength={500}
                                                                        value={item.details || ""}
                                                                        placeholder="Détails supplémentaires…"
                                                                        onChange={(e) =>
                                                                            setItem(item.id, {
                                                                                details: e.target.value,
                                                                            })
                                                                        }
                                                                        className="w-full resize-none rounded-md border border-white/10 bg-[#131722] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-[#2563EB] focus:outline-none"
                                                                    />
                                                                    <span className="pointer-events-none absolute bottom-1.5 right-2.5 text-[10px] text-slate-500">
                                                                        {(item.details || "").length}/500
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2.5 sm:contents">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                                                        Prix
                                                                    </label>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        aria-label="Prix"
                                                                        value={item.unitPrice}
                                                                        onChange={(e) =>
                                                                            setItem(item.id, {
                                                                                unitPrice: Number(e.target.value),
                                                                            })
                                                                        }
                                                                        className={`${FIELD} text-right font-medium`}
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                                                        Quantité
                                                                    </label>
                                                                    <Input
                                                                        type="number"
                                                                        min={1}
                                                                        aria-label="Quantité"
                                                                        value={item.quantity}
                                                                        onChange={(e) =>
                                                                            setItem(item.id, {
                                                                                quantity: Number(e.target.value),
                                                                            })
                                                                        }
                                                                        className={`${FIELD} text-right font-medium`}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 items-end gap-2.5 sm:contents">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                                                        Montant
                                                                    </label>
                                                                    <div className="flex h-9 items-center justify-end text-xs font-semibold text-slate-200 sm:justify-end">
                                                                        {formatMoney(lineTotal, draft.currency)}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:hidden">
                                                                        Taxes
                                                                    </label>
                                                                    <div className="flex h-9 items-center sm:justify-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setItem(item.id, {
                                                                                    taxable: !item.taxable,
                                                                                })
                                                                            }
                                                                            className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                                                                                item.taxable
                                                                                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                                                                                    : "border-white/20 bg-[#131722] text-transparent"
                                                                            }`}
                                                                            aria-label="Taxe applicable"
                                                                        >
                                                                            <Check className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <span className="ml-2 text-[11px] text-slate-400 sm:hidden">
                                                                            {item.taxable ? "Oui" : "Non"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="border-t border-white/10 pt-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        items: [...prev.items, emptyPublicInvoiceLine()],
                                                    }))
                                                }
                                                className="flex h-8 w-9 items-center justify-center rounded bg-[#2563EB] text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
                                                aria-label="Ajouter une ligne"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* ═══════════ TOTAUX ═══════════ */}
                                    <div className="flex justify-end border-t border-white/10 pt-4">
                                        <div className="w-full max-w-[300px] space-y-1.5 text-xs">
                                            <div className="flex items-center justify-between text-slate-400">
                                                <span>Sous-total</span>
                                                <span className="font-medium text-slate-200">
                                                    {formatMoney(totals.subtotal, draft.currency)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-400">
                                                <span>
                                                    Taxe ({draft.hasVat ? draft.vatRate : 0}%)
                                                </span>
                                                <span className="font-medium text-slate-200">
                                                    {formatMoney(totals.tax, draft.currency)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-300">
                                                <span>Total</span>
                                                <span className="font-semibold text-white">
                                                    {formatMoney(totals.total, draft.currency)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-white/10 pt-2 text-sm font-bold text-white">
                                                <span>Solde dû</span>
                                                <span>{formatMoney(totals.total, draft.currency)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ═══════════ NOTES ═══════════ */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-300">
                                            Notes
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                rows={4}
                                                maxLength={1000}
                                                value={draft.notes}
                                                onChange={(e) => update({ notes: e.target.value })}
                                                placeholder="Informations complémentaires, modalités de paiement (Mobile Money, virement…)"
                                                className="w-full resize-none rounded-md border border-white/10 bg-[#131722] p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-[#2563EB] focus:outline-none"
                                            />
                                            <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-slate-500">
                                                {draft.notes.length}/1000
                                            </span>
                                        </div>
                                    </div>

                                    {/* ═══════════ SIGNATURE (IMAGE PNG) ═══════════ */}
                                    <div className="border-t border-white/[0.07] pt-5">
                                        <SignaturePad
                                            value={draft.signatureImage}
                                            onChange={(signatureImage) => update({ signatureImage })}
                                            showSignedDate
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Barre de bas de page (Fermer / Réinitialiser) */}
                        <div className="mt-4 flex items-center justify-between">
                            <Link
                                href={mode === "app" ? "/dashboard/invoices" : "/"}
                                className="inline-flex h-9 items-center rounded-md border border-white/10 bg-[#111520] px-4 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                            >
                                Fermer la facture
                            </Link>

                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm("Réinitialiser le contenu de cette facture ?")) {
                                        clear()
                                    }
                                }}
                                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 bg-[#111520] px-4 text-xs font-semibold text-slate-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Supprimer la facture
                            </button>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        COLONNE DROITE — MINI APERÇU + PARAMÈTRES + ACTIONS
                    ═══════════════════════════════════════════════════════════ */}
                    <aside className="space-y-5 lg:sticky lg:top-6">
                        {/* Miniature A4 cliquable */}
                        <div className="space-y-1.5">
                            <PublicInvoicePreview
                                draft={draft}
                                variant="thumbnail"
                                onSelect={() =>
                                    setActiveView((v) => (v === "preview" ? "edit" : "preview"))
                                }
                            />
                            <p className="text-center text-[11px] text-slate-500">
                                Cliquez sur la miniature pour agrandir l’aperçu
                            </p>
                        </div>

                        {/* APERÇU PAR EMAIL */}
                        <div className="space-y-2 border-t border-white/10 pt-4">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Aperçu via email
                            </label>
                            <Input
                                type="email"
                                value={previewEmail}
                                onChange={(e) => setPreviewEmail(e.target.value)}
                                placeholder="votre@email.com"
                                className={`${FIELD} bg-[#111520]`}
                            />
                            <Button
                                type="button"
                                disabled={busy}
                                onClick={() => void persistInvoice("save")}
                                className="h-9 w-full bg-[#1E2433] text-xs font-semibold text-slate-100 hover:bg-[#283044]"
                            >
                                Envoyer
                            </Button>
                        </div>

                        {/* COULEUR DU MODÈLE */}
                        <div className="space-y-2.5 border-t border-white/10 pt-4">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Couleur personnalisée
                            </label>
                            <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-[#111520] p-2.5">
                                {BRAND_SWATCHES.map((swatch) => {
                                    const active =
                                        draft.brandColor.toLowerCase() === swatch.value.toLowerCase()
                                    return (
                                        <button
                                            key={swatch.value}
                                            type="button"
                                            title={swatch.label}
                                            onClick={() => update({ brandColor: swatch.value })}
                                            className={`flex h-6 w-6 items-center justify-center rounded transition-transform ${
                                                active ? "scale-110 ring-2 ring-white" : "opacity-85 hover:opacity-100"
                                            }`}
                                            style={{ backgroundColor: swatch.value }}
                                        >
                                            {active && <Check className="h-3.5 w-3.5 text-white" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* TAXE & DEVISE */}
                        <div className="space-y-3 border-t border-white/10 pt-4 text-xs">
                            <div className="grid grid-cols-[72px_1fr] items-center gap-2">
                                <span className="text-slate-400">Taxe</span>
                                <select
                                    value={draft.hasVat ? "total" : "none"}
                                    onChange={(e) => {
                                        const enabled = e.target.value === "total"
                                        update({
                                            hasVat: enabled,
                                            vatRate: enabled ? draft.vatRate || 19.25 : 0,
                                        })
                                    }}
                                    className="h-9 rounded-md border border-white/10 bg-[#111520] px-2.5 text-xs text-slate-100 focus:border-[#2563EB] focus:outline-none"
                                >
                                    <option value="none">Aucune</option>
                                    <option value="total">Sur le total</option>
                                </select>
                            </div>

                            {draft.hasVat && (
                                <div className="grid grid-cols-[72px_1fr] items-center gap-2">
                                    <span className="text-slate-400">Taux</span>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step="0.01"
                                            value={draft.vatRate}
                                            onChange={(e) =>
                                                update({ vatRate: Number(e.target.value) })
                                            }
                                            className={`${FIELD} bg-[#111520] pr-7`}
                                        />
                                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            %
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-[72px_1fr] items-center gap-2">
                                <span className="text-slate-400">Devise</span>
                                <select
                                    value={
                                        CURRENCY_LABELS[draft.currency]
                                            ? draft.currency
                                            : "XOF"
                                    }
                                    onChange={(e) => update({ currency: e.target.value })}
                                    className="h-9 rounded-md border border-white/10 bg-[#111520] px-2.5 text-xs font-semibold text-white focus:border-[#2563EB] focus:outline-none"
                                >
                                    {Object.keys(CURRENCY_LABELS).map((code) => (
                                        <option
                                            key={code}
                                            value={code}
                                            className="bg-[#111520]"
                                        >
                                            {currencyOptionLabel(code)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="hidden space-y-2 border-t border-white/10 pt-4 lg:block">
                            <Button
                                type="button"
                                onClick={() =>
                                    setActiveView((v) => (v === "preview" ? "edit" : "preview"))
                                }
                                className="h-10 w-full bg-[#2563EB] text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-[#1d4ed8]"
                            >
                                <Eye className="mr-1.5 h-4 w-4" />
                                {activeView === "preview" ? "Retour à l’édition" : "Aperçu"}
                            </Button>

                            <Button
                                type="button"
                                disabled={busy}
                                onClick={() => void persistInvoice("save")}
                                className="h-10 w-full bg-[#182030] text-xs font-bold text-slate-100 hover:bg-[#222d42]"
                            >
                                <Link2 className="mr-1.5 h-4 w-4" />
                                Obtenir le lien
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => void persistInvoice("download")}
                                className="h-10 w-full border-white/10 bg-[#111520] text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
                            >
                                <Printer className="mr-1.5 h-4 w-4" />
                                Télécharger / Imprimer
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>

            <nav
                aria-label="Actions facture"
                className="fixed inset-x-0 bottom-0 z-40 transform-gpu border-t border-white/10 bg-[#0B0E16]/95 shadow-[0_-12px_32px_rgba(0,0,0,0.45)] backdrop-blur-md lg:hidden"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
                <div className="grid grid-cols-3 gap-1.5 px-2.5 pt-2 pb-2">
                    <button
                        type="button"
                        onClick={() =>
                            setActiveView((v) => (v === "preview" ? "edit" : "preview"))
                        }
                        className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center text-[10px] font-semibold leading-tight transition-transform active:scale-[0.98] ${
                            activeView === "preview"
                                ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/25"
                                : "bg-white/[0.06] text-slate-200"
                        }`}
                    >
                        <Eye className="h-4 w-4" />
                        {activeView === "preview" ? "Éditer" : "Aperçu"}
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => void persistInvoice("save")}
                        className="flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl bg-white/[0.06] px-1 text-center text-[10px] font-semibold leading-tight text-slate-200 transition-transform active:scale-[0.98] disabled:opacity-50"
                    >
                        {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Link2 className="h-4 w-4" />
                        )}
                        Obtenir le lien
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => void persistInvoice("download")}
                        className="flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl bg-white/[0.06] px-1 text-center text-[10px] font-semibold leading-tight text-slate-200 transition-transform active:scale-[0.98] disabled:opacity-50"
                    >
                        {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Télécharger
                    </button>
                </div>
            </nav>
        </div>
    )
}

function InlineField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    clearable = false,
    onClear,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    clearable?: boolean
    onClear?: () => void
}) {
    return (
        <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[84px_1fr] sm:gap-2">
            <span className="text-xs font-medium text-slate-400">{label}</span>
            <div className="relative">
                <Input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${FIELD} ${clearable ? "pr-8" : ""}`}
                />
                {clearable && onClear ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                        aria-label="Effacer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                ) : null}
            </div>
        </div>
    )
}
