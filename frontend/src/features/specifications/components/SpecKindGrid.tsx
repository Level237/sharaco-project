"use client"

import { BookOpen, Briefcase, GraduationCap, Hammer, PenTool, Repeat, Search, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SPEC_KINDS, type SpecKind } from "../kinds"

const KIND_ICON: Record<SpecKind, LucideIcon> = {
    mission: Briefcase,
    chantier: Hammer,
    creation: PenTool,
    accompagnement: Repeat,
    cadrage: Search,
    formation: GraduationCap,
}

export function SpecKindGrid({
    onSelect,
    disabled,
}: {
    onSelect: (kind: SpecKind) => void
    disabled?: boolean
}) {
    return (
        <div className="rounded-2xl border border-slate-200/50 bg-white/50 p-1.5 dark:border-white/5 dark:bg-white/5 sm:p-2">
            {SPEC_KINDS.map((kind, index) => {
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
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{kind.useWhen}</p>
                            </div>
                            <BookOpen className="h-4 w-4 shrink-0 text-slate-300" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
