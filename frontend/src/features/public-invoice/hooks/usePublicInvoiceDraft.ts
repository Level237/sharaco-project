"use client"

import { useCallback, useEffect, useState } from "react"
import {
    PUBLIC_INVOICE_DRAFT_KEY,
    clearPublicInvoiceDraft,
    readPublicInvoiceDraft,
    writePublicInvoiceDraft,
} from "../storage"
import { CURRENCY_LABELS, detectCurrency } from "@/lib/currency"
import type { PublicInvoiceDraft } from "../types"

export function usePublicInvoiceDraft() {
    const [draft, setDraft] = useState<PublicInvoiceDraft>(readPublicInvoiceDraft)
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        const stored =
            typeof window !== "undefined"
                ? window.localStorage.getItem(PUBLIC_INVOICE_DRAFT_KEY)
                : null
        const next = readPublicInvoiceDraft()
        if (!stored || !CURRENCY_LABELS[next.currency]) {
            next.currency = detectCurrency()
        }
        setDraft(next)
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (!hydrated) return
        writePublicInvoiceDraft(draft)
    }, [draft, hydrated])

    const update = useCallback((patch: Partial<PublicInvoiceDraft>) => {
        setDraft((prev) => ({ ...prev, ...patch }))
    }, [])

    const clear = useCallback(() => {
        clearPublicInvoiceDraft()
        setDraft(readPublicInvoiceDraft())
    }, [])

    return { draft, setDraft, update, clear, hydrated }
}
