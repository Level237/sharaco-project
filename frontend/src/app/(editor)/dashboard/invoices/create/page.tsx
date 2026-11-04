"use client"

import { Suspense } from "react"
import { PublicInvoiceEditor } from "@/features/public-invoice/components/PublicInvoiceEditor"

export default function CreateInvoicePage() {
    return (
        <Suspense fallback={<div className="min-h-[100dvh] bg-slate-950" />}>
            <PublicInvoiceEditor mode="app" />
        </Suspense>
    )
}
