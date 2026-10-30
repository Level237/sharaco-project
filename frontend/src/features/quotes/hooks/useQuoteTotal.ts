import { useEffect, useMemo, useState } from "react"
import { QuoteLineItem } from "../types/QuoteBuilder"
import { useDebouncedValue } from "./useDebouncedValue"
import { quotesApi } from "../api/quotesApi"

interface QuoteTotals {
    subTotal: number
    totalTax: number
    grandTotal: number
    totalsError: string | null
}

function lineSubtotal(item: QuoteLineItem) {
    return (item.quantity || 0) * (item.unitPrice || 0)
}

export function useQuoteTotal(
    items: QuoteLineItem[],
    hasVat: boolean = false,
    vatRate: number = 20,
    isTaxExempt: boolean = false,
): QuoteTotals {
    const subTotal = useMemo(
        () => items.reduce((sum, item) => sum + lineSubtotal(item), 0),
        [items],
    )

    const payload = useMemo(
        () =>
            items.map((item) => ({
                description: item.description || "",
                quantity: item.quantity || 0,
                unit_price_cents: item.unitPrice || 0,
                tax_rate: hasVat && !isTaxExempt ? (item.tax_rate ?? vatRate) : 0,
            })),
        [items, hasVat, vatRate, isTaxExempt],
    )
    const debouncedItems = useDebouncedValue(payload, 250)

    const [serverTotals, setServerTotals] = useState({ totalTax: 0, grandTotal: subTotal })
    const [totalsError, setTotalsError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        quotesApi
            .calculateTotals(debouncedItems)
            .then((result) => {
                if (cancelled) return
                setTotalsError(null)
                setServerTotals({
                    totalTax: result.tax_total_cents || 0,
                    grandTotal: result.grand_total_cents || 0,
                })
            })
            .catch(() => {
                if (!cancelled) {
                    setTotalsError("Impossible de calculer les totaux. Vérifiez la connexion et réessayez.")
                }
            })
        return () => {
            cancelled = true
        }
    }, [debouncedItems])

    return {
        subTotal,
        totalTax: serverTotals.totalTax,
        grandTotal: serverTotals.grandTotal,
        totalsError,
    }
}
