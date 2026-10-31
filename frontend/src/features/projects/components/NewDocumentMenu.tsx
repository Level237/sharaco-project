"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { type ContractKind } from "@/features/contracts/kinds"
import { contractEditHref } from "@/features/contracts/paths"
import { NewDocumentPicker } from "./NewDocumentPicker"

interface NewDocumentMenuProps {
    projectId: string
    variant?: "header" | "card" | "empty"
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function NewDocumentMenu({
    projectId,
    variant = "header",
    open: openProp,
    onOpenChange: onOpenChangeProp,
}: NewDocumentMenuProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [creating, setCreating] = useState(false)
    const [internalOpen, setInternalOpen] = useState(false)

    const open = openProp ?? internalOpen
    const setOpen = onOpenChangeProp ?? setInternalOpen

    const createQuote = () => {
        router.push(`/dashboard/quotes/create?project_id=${projectId}`)
    }

    const createContract = async (kind: ContractKind) => {
        setCreating(true)
        try {
            const document = await quotesApi.create({
                type: "CONTRAT",
                layout_style: kind,
                project_id: projectId,
                items: [],
                notes: "",
            })
            router.push(contractEditHref(document.id))
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Impossible de créer le contrat."
            toast({ title: "Erreur", description: message, variant: "destructive" })
            setCreating(false)
        }
    }

    const picker = (
        <NewDocumentPicker
            open={open}
            onOpenChange={setOpen}
            onSelectQuote={createQuote}
            onSelectContract={createContract}
            busy={creating}
        />
    )

    if (variant === "card") {
        return (
            <>
                <button
                    type="button"
                    className="group flex h-full w-full flex-col outline-none"
                    disabled={creating}
                    onClick={() => setOpen(true)}
                >
                    <div className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-transparent transition-all group-hover:border-solid group-hover:border-white/30 group-hover:bg-white/5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900">
                            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">Nouveau document</span>
                    </div>
                </button>
                {picker}
            </>
        )
    }

    if (variant === "empty") {
        return (
            <>
                <Button
                    className="bg-[#2563EB] text-white hover:bg-[#2563EB]/90"
                    disabled={creating}
                    onClick={() => setOpen(true)}
                >
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Nouveau document
                </Button>
                {picker}
            </>
        )
    }

    return (
        <>
            <Button
                size="sm"
                className={cn("h-8 gap-1.5 bg-[#2563EB] px-3 text-xs text-white hover:bg-[#2563EB]/90")}
                disabled={creating}
                onClick={() => setOpen(true)}
            >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Nouveau document</span>
            </Button>
            {picker}
        </>
    )
}
