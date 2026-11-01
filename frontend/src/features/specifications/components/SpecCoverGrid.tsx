"use client"

import { cn } from "@/lib/utils"
import { SPEC_COVERS, type SpecCover } from "../covers"

function CoverThumb({ id, color }: { id: SpecCover; color: string }) {
    if (id === "spine") {
        return (
            <div className="relative h-16 w-12 overflow-hidden rounded-md bg-[#faf8f5]">
                <div className="absolute inset-y-0 left-0 w-2" style={{ background: color }} />
                <div className="absolute left-3 top-3 h-1 w-6 rounded bg-slate-300" />
                <div className="absolute left-3 top-6 h-2 w-7 rounded bg-slate-200" />
            </div>
        )
    }
    if (id === "masthead") {
        return (
            <div className="relative h-16 w-12 overflow-hidden rounded-md bg-[#faf8f5]">
                <div className="h-7 w-full" style={{ background: color }} />
                <div className="absolute left-2 top-9 h-1.5 w-7 rounded bg-slate-200" />
            </div>
        )
    }
    if (id === "folio") {
        return (
            <div className="relative flex h-16 w-12 flex-col overflow-hidden rounded-md bg-[#faf8f5] p-2">
                <div className="h-1 w-5 rounded" style={{ background: color }} />
                <div className="mt-2 h-3 w-7 rounded bg-slate-300" />
                <div className="mt-auto h-1 w-full bg-slate-200" />
            </div>
        )
    }
    if (id === "panel") {
        return (
            <div className="flex h-16 w-12 items-end overflow-hidden rounded-md bg-[#faf8f5] p-1.5">
                <div className="h-10 w-full rounded-sm" style={{ background: color }} />
            </div>
        )
    }
    return (
        <div className="flex h-16 w-12 flex-col gap-1 overflow-hidden rounded-md bg-[#faf8f5] p-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            <div className="h-px w-full bg-slate-200" />
            <div className="h-px w-full bg-slate-200" />
            <div className="h-px w-full bg-slate-200" />
        </div>
    )
}

export function SpecCoverGrid({
    selected,
    color,
    onSelect,
}: {
    selected: SpecCover
    color: string
    onSelect: (cover: SpecCover) => void
}) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {SPEC_COVERS.map((cover) => (
                <button
                    key={cover.id}
                    type="button"
                    onClick={() => onSelect(cover.id)}
                    className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-center transition-colors",
                        selected === cover.id
                            ? "bg-[#2563EB]/10 ring-2 ring-[#2563EB]"
                            : "hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                >
                    <CoverThumb id={cover.id} color={color} />
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{cover.title}</span>
                </button>
            ))}
        </div>
    )
}
