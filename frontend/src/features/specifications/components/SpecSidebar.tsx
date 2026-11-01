"use client"

import { ArrowDown, ArrowUp, BookOpen, ListOrdered, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalText } from "../hooks/useLocalText"
import type { SpecSection } from "../types"

const ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

export function roman(index: number) {
    return ROMANS[index] || String(index + 1)
}

export function SpecSidebar({
    sections,
    activeId,
    accent,
    onJump,
    onRenameSection,
    onMoveSection,
    onAddSection,
    onRemoveSection,
    onAddSubsection,
}: {
    sections: SpecSection[]
    activeId?: string | null
    accent: string
    onJump: (id: string) => void
    onRenameSection: (id: string, title: string) => void
    onMoveSection: (index: number, direction: -1 | 1) => void
    onAddSection: () => void
    onRemoveSection: (id: string) => void
    onAddSubsection: (sectionId: string) => void
}) {
    return (
        <div className="flex h-full flex-col border-r border-white/10 bg-zinc-950 text-zinc-200">
            <div className="space-y-1 border-b border-white/10 p-3">
                <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Pages du document
                </div>
                <button
                    type="button"
                    onClick={() => onJump("cover")}
                    className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors",
                        activeId === "cover"
                            ? "bg-white/10 text-white"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                    <span>Page 1 · Couverture</span>
                </button>
                <button
                    type="button"
                    onClick={() => onJump("toc")}
                    className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors",
                        activeId === "toc"
                            ? "bg-white/10 text-white"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <span className="flex items-center gap-2.5">
                        <ListOrdered className="h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                        <span>Page 2 · Sommaire</span>
                    </span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                        {sections.length} parties
                    </span>
                </button>
            </div>

            <div className="flex items-center justify-between px-4 pb-1.5 pt-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Grandes parties (Sommaire)
                </span>
            </div>

            <nav className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-2">
                {sections.map((section, sIdx) => (
                    <div
                        key={section.id}
                        className={cn(
                            "group/sec rounded-xl border p-2 transition-colors",
                            activeId === section.id
                                ? "border-white/20 bg-white/[0.06]"
                                : "border-white/5 bg-white/[0.02] hover:border-white/10"
                        )}
                    >
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => onJump(section.id)}
                                title="Aller à cette partie"
                                className="shrink-0 rounded px-1 py-0.5 font-mono text-[11px] font-extrabold hover:bg-white/10"
                                style={{ color: accent }}
                            >
                                {roman(sIdx)}.
                            </button>
                            <SidebarTitleInput
                                value={section.title}
                                onCommit={(title) => onRenameSection(section.id, title)}
                                onFocus={() => onJump(section.id)}
                            />
                            <div className="flex items-center opacity-0 transition-opacity group-hover/sec:opacity-100 focus-within:opacity-100">
                                <button
                                    type="button"
                                    disabled={sIdx === 0}
                                    onClick={() => onMoveSection(sIdx, -1)}
                                    title="Monter"
                                    className="rounded p-0.5 text-zinc-500 hover:text-white disabled:opacity-20"
                                >
                                    <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                    type="button"
                                    disabled={sIdx === sections.length - 1}
                                    onClick={() => onMoveSection(sIdx, 1)}
                                    title="Descendre"
                                    className="rounded p-0.5 text-zinc-500 hover:text-white disabled:opacity-20"
                                >
                                    <ArrowDown className="h-3 w-3" />
                                </button>
                                {sections.length > 1 && (
                                    <button
                                        type="button"
                                        title="Supprimer la partie"
                                        onClick={() => onRemoveSection(section.id)}
                                        className="rounded p-0.5 text-zinc-500 hover:text-rose-400"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-1.5 space-y-0.5 border-l border-white/10 pl-2.5 ml-2">
                            {section.subsections.map((sub, subIdx) => (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => onJump(sub.id)}
                                    className={cn(
                                        "flex w-full items-baseline gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] transition-colors",
                                        activeId === sub.id
                                            ? "bg-white/10 text-white"
                                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                    )}
                                >
                                    <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                                        {subIdx + 1}.
                                    </span>
                                    <span className="truncate">{sub.title || "Sous-section"}</span>
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => onAddSubsection(section.id)}
                                className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-[10px] font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                            >
                                <Plus className="h-2.5 w-2.5" />
                                Sous-section
                            </button>
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-white/10 p-3 space-y-2">
                <button
                    type="button"
                    onClick={onAddSection}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une grande partie ({roman(sections.length)}.)
                </button>
                <p className="px-1 text-[10px] leading-snug text-zinc-500">
                    Couverture · Sommaire dédié · Corps I / 1-2-3. Ce document n’est pas un conseil juridique.
                </p>
            </div>
        </div>
    )
}

function SidebarTitleInput({
    value,
    onCommit,
    onFocus,
}: {
    value: string
    onCommit: (title: string) => void
    onFocus: () => void
}) {
    const { local, setLocal, flush } = useLocalText(value, onCommit)
    return (
        <input
            type="text"
            value={local}
            onFocus={onFocus}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={flush}
            placeholder="Titre de la grande partie"
            className="min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-xs font-semibold text-zinc-100 outline-none placeholder:text-zinc-600 focus:bg-white/10"
        />
    )
}
