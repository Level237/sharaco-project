"use client"

import { Briefcase, ChevronRight, Loader2, Lock, PenTool, Repeat, ScrollText, type LucideIcon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CONTRACT_KINDS, type ContractKind } from "../kinds"

const KIND_ICON: Record<ContractKind, LucideIcon> = {
    prestation: Briefcase,
    cession: PenTool,
    recurrent: Repeat,
    nda: Lock,
}

export function ContractKindGrid({
    onSelect,
    disabled,
}: {
    onSelect: (kind: ContractKind) => void
    disabled?: boolean
}) {
    return (
        <div className="rounded-2xl border border-slate-200/50 bg-white/50 p-1.5 dark:border-white/5 dark:bg-white/5 sm:p-2">
            {CONTRACT_KINDS.map((kind, index) => {
                const Icon = KIND_ICON[kind.id]
                return (
                    <div key={kind.id}>
                        {index > 0 && <div className="my-1 h-px w-full bg-slate-200/50 dark:bg-white/5" />}
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelect(kind.id)}
                            className={cn(
                                "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors sm:gap-4 sm:px-3",
                                "hover:bg-slate-100 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]",
                                "disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 ring-1 ring-white/20 transition-colors group-hover:bg-[#2563EB] dark:bg-blue-500/15 dark:ring-white/10">
                                <Icon className="h-[18px] w-[18px] text-blue-600 transition-colors group-hover:text-white dark:text-blue-400" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{kind.title}</p>
                                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 sm:whitespace-normal">
                                    {kind.useWhen}
                                </p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-slate-900 dark:group-hover:text-white" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export function ContractKindPicker({
    open,
    onOpenChange,
    onSelect,
    busy,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (kind: ContractKind) => void
    busy?: boolean
}) {
    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent className="max-w-[92vw] overflow-hidden rounded-3xl border-slate-200/50 bg-white/70 p-0 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0a0a0a]/80 sm:max-w-[420px]">
                {busy ? (
                    <div className="flex flex-col items-center justify-center space-y-4 px-6 py-12 text-center">
                        <div className="relative mb-2">
                            <div className="absolute inset-0 rounded-full bg-[#2563EB]/20 blur-xl" />
                            <Loader2 className="relative z-10 h-10 w-10 animate-spin text-[#2563EB]" />
                        </div>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                            Création en cours…
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Nous préparons le contrat et vous redirigeons vers l’éditeur.
                        </DialogDescription>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="flex flex-col items-center bg-gradient-to-b from-blue-500/10 to-transparent px-4 pb-5 pt-8 text-center sm:px-6 sm:pt-10">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 shadow-inner ring-1 ring-white/20 dark:bg-blue-500/20 dark:ring-white/10">
                                <ScrollText className="h-8 w-8 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                            </div>
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                                Quel contrat ?
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 max-w-[300px] text-sm text-slate-500 dark:text-slate-400">
                                Choisissez selon le besoin, pas selon le look.
                            </DialogDescription>
                        </div>

                        <div className="space-y-3 px-4 pb-5 sm:px-6 sm:pb-6">
                            <ContractKindGrid onSelect={onSelect} />

                            <p className="px-1 text-center text-[11px] leading-snug text-slate-400 dark:text-slate-500">
                                Les articles proposés sont une base à adapter. Ce n’est pas un conseil juridique.
                            </p>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="h-10 w-full rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-white/5 sm:h-11"
                            >
                                Annuler
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
