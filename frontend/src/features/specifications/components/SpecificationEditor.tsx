"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Check, Eye, FileDown, ListTree, Loader2, Mail, Minus, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { projectHref } from "@/features/projects/lib/paths"
import { useAuthStore } from "@/store/auth-store"
import { specificationsApi } from "../api/specificationsApi"
import { SPEC_BRAND_COLORS } from "../brandColors"
import { SPEC_COVERS, normalizeSpecCover, type SpecCover } from "../covers"
import { normalizeSpecKind } from "../kinds"
import type { SpecificationDraft } from "../types"
import { SpecCoverGrid } from "./SpecCoverGrid"
import { SpecLivePreview, createDefaultSection, createDefaultSubsection } from "./SpecLivePreview"
import { SpecSidebar } from "./SpecSidebar"
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal"

export function SpecificationEditor({ specId }: { specId: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const user = useAuthStore((state) => state.user)
    const [draft, setDraft] = useState<SpecificationDraft | null>(null)
    const [loading, setLoading] = useState(true)
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("saved")
    const [downloading, setDownloading] = useState(false)
    const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
    const [zoom, setZoom] = useState(1)
    const [sheetHeight, setSheetHeight] = useState(3200)
    const [activeNodeId, setActiveNodeId] = useState<string | null>("cover")
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [emailOpen, setEmailOpen] = useState(false)
    const hydratedRef = useRef(false)
    const lastSavedJsonRef = useRef("")
    const draftRef = useRef<SpecificationDraft | null>(null)
    const savingRef = useRef(false)
    const pendingSaveRef = useRef(false)
    const mainRef = useRef<HTMLElement>(null)
    const sheetRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const spec = await specificationsApi.getById(specId)
                if (cancelled) return
                const initial: SpecificationDraft = {
                    id: spec.id,
                    projectId: spec.project_id,
                    clientId: spec.client_id,
                    clientName: spec.client_name,
                    clientEmail: spec.client_email,
                    status: spec.status,
                    projectName: spec.project_name,
                    number: spec.number,
                    title: (spec.title || "Cahier des charges").replace(/\s*(—|--)\s*/g, " : "),
                    kind: normalizeSpecKind(spec.kind),
                    coverStyle: normalizeSpecCover(spec.cover_style),
                    primaryColor: spec.primary_color,
                    version: spec.version,
                    sections:
                        spec.sections && spec.sections.length > 0
                            ? spec.sections
                            : [createDefaultSection(0)],
                }
                lastSavedJsonRef.current = serializeDraft(initial)
                draftRef.current = initial
                setDraft(initial)
                hydratedRef.current = true
            } catch (error: unknown) {
                toast({
                    title: "Erreur",
                    description: error instanceof Error ? error.message : "Impossible de charger le CDC.",
                    variant: "destructive",
                })
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [specId, toast])

    const persist = useCallback(async () => {
        const current = draftRef.current
        if (!current) return
        if (savingRef.current) {
            pendingSaveRef.current = true
            return
        }
        const snapshot = serializeDraft(current)
        if (snapshot === lastSavedJsonRef.current) return
        savingRef.current = true
        setSaveState("saving")
        try {
            await specificationsApi.update(current.id, {
                title: current.title.trim() || "Cahier des charges",
                cover_style: current.coverStyle,
                primary_color: current.primaryColor,
                sections: current.sections,
            })
            lastSavedJsonRef.current = snapshot
            setSaveState("saved")
        } catch {
            setSaveState("idle")
        } finally {
            savingRef.current = false
            if (pendingSaveRef.current) {
                pendingSaveRef.current = false
                void persist()
            }
        }
    }, [])

    useEffect(() => {
        draftRef.current = draft
        if (!draft || !hydratedRef.current) return
        if (serializeDraft(draft) === lastSavedJsonRef.current) return
        setSaveState("idle")
        const timer = window.setTimeout(() => {
            void persist()
        }, 8000)
        return () => window.clearTimeout(timer)
    }, [draft, persist])

    useEffect(() => {
        const flush = () => {
            void persist()
        }
        window.addEventListener("beforeunload", flush)
        return () => {
            window.removeEventListener("beforeunload", flush)
            void persist()
        }
    }, [persist])

    const computeDefaultZoom = useCallback(() => {
        if (typeof window === "undefined") return 1
        if (window.innerWidth >= 1024) return 1
        const fit = (window.innerWidth - 24) / 820
        return Math.round(Math.min(1, Math.max(0.38, fit)) * 100) / 100
    }, [])

    useEffect(() => {
        setZoom(computeDefaultZoom())
    }, [computeDefaultZoom])

    useEffect(() => {
        const el = sheetRef.current
        if (!el) return
        const update = () => setSheetHeight(el.offsetHeight || 3200)
        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [draft, viewMode, loading])

    useEffect(() => {
        const container = mainRef.current
        if (!container) return
        let initialDistance: number | null = null
        let initialZoom = 1

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
                setZoom((prev) =>
                    Math.round(Math.min(1.4, Math.max(0.35, prev - e.deltaY * 0.003)) * 100) / 100
                )
            }
        }

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                )
                setZoom((prev) => {
                    initialZoom = prev
                    return prev
                })
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && initialDistance !== null) {
                e.preventDefault()
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                )
                const next = initialZoom * (dist / initialDistance)
                setZoom(Math.round(Math.min(1.4, Math.max(0.35, next)) * 100) / 100)
            }
        }

        const handleTouchEnd = () => {
            initialDistance = null
        }

        container.addEventListener("wheel", handleWheel, { passive: false })
        container.addEventListener("touchstart", handleTouchStart, { passive: false })
        container.addEventListener("touchmove", handleTouchMove, { passive: false })
        container.addEventListener("touchend", handleTouchEnd)
        container.addEventListener("touchcancel", handleTouchEnd)
        return () => {
            container.removeEventListener("wheel", handleWheel)
            container.removeEventListener("touchstart", handleTouchStart)
            container.removeEventListener("touchmove", handleTouchMove)
            container.removeEventListener("touchend", handleTouchEnd)
            container.removeEventListener("touchcancel", handleTouchEnd)
        }
    }, [loading])

    const handleDownloadPdf = async () => {
        if (!draft) return
        setDownloading(true)
        try {
            await persist()
            const safeTitle = (draft.title || draft.number || "Cahier des charges")
                .replace(/[\\/*?:"<>|\r\n]+/g, "")
                .trim()
            await specificationsApi.downloadPdf(draft.id, `${safeTitle || "Cahier des charges"}.pdf`)
        } catch (error: unknown) {
            toast({
                title: "Erreur PDF",
                description: error instanceof Error ? error.message : "Impossible de générer le PDF.",
                variant: "destructive",
            })
        } finally {
            setDownloading(false)
        }
    }

    const jumpToNode = (id: string) => {
        setActiveNodeId(id)
        setDrawerOpen(false)
        const el = document.getElementById(`spec-node-${id}`)
        el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    if (loading || !draft) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
        )
    }

    const backHref =
        draft.projectId && draft.clientId
            ? projectHref(draft.clientId, draft.projectId)
            : "/dashboard/clients"

    const patchDraft = (patch: Partial<SpecificationDraft>) => {
        setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
    }

    const renameSection = (id: string, rawTitle: string) => {
        const title = rawTitle.replace(/^\s*(?:[IVXLCDM]{1,5}|\d{1,2})\s*[-.:)]\s+/i, "")
        patchDraft({
            sections: draft.sections.map((s) => (s.id === id ? { ...s, title } : s)),
        })
    }

    const moveSection = (index: number, direction: -1 | 1) => {
        const target = index + direction
        if (target < 0 || target >= draft.sections.length) return
        const next = [...draft.sections]
        const [item] = next.splice(index, 1)
        next.splice(target, 0, item)
        patchDraft({ sections: next })
    }

    const addSection = () => {
        const created = createDefaultSection(draft.sections.length)
        patchDraft({ sections: [...draft.sections, created] })
        setTimeout(() => jumpToNode(created.id), 60)
    }

    const removeSection = (id: string) => {
        if (draft.sections.length <= 1) return
        patchDraft({ sections: draft.sections.filter((s) => s.id !== id) })
    }

    const addSubsection = (sectionId: string) => {
        const created = createDefaultSubsection()
        patchDraft({
            sections: draft.sections.map((s) =>
                s.id === sectionId ? { ...s, subsections: [...s.subsections, created] } : s
            ),
        })
        setTimeout(() => jumpToNode(created.id), 60)
    }

    const companyName = user?.company_name || user?.full_name || "Prestataire"

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-zinc-950">
            <header className="fixed inset-x-0 top-0 z-[80] flex h-14 items-center justify-between gap-2 border-b border-white/10 bg-zinc-950/90 px-3 backdrop-blur-xl sm:h-16 sm:px-5">
                <div className="flex min-w-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.push(backHref)}
                        className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Projet</span>
                    </button>
                    <span className="hidden text-zinc-700 sm:inline">/</span>
                    <span className="truncate font-mono text-xs text-zinc-400">
                        {draft.number || "CDC"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDrawerOpen(true)}
                        className="h-9 w-9 border border-white/10 bg-white/5 text-zinc-200 lg:hidden"
                        title="Sommaire"
                    >
                        <ListTree className="h-4 w-4" />
                    </Button>

                    {/* Bascule Édition / Aperçu (desktop) */}
                    <div className="hidden h-9 items-center rounded-lg border border-white/10 bg-white/5 p-0.5 lg:flex">
                        <button
                            type="button"
                            onClick={() => setViewMode("edit")}
                            className={cn(
                                "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
                                viewMode === "edit"
                                    ? "bg-[#2563EB] text-white shadow-sm"
                                    : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <Pencil className="h-3 w-3" />
                            <span>Édition</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("preview")}
                            className={cn(
                                "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
                                viewMode === "preview"
                                    ? "bg-[#2563EB] text-white shadow-sm"
                                    : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <Eye className="h-3 w-3" />
                            <span>Aperçu</span>
                        </button>
                    </div>

                    <CoverPicker
                        selected={draft.coverStyle}
                        color={draft.primaryColor}
                        onSelect={(coverStyle) => patchDraft({ coverStyle })}
                    />

                    <ColorPicker
                        color={draft.primaryColor}
                        onChange={(primaryColor) => patchDraft({ primaryColor })}
                    />

                    <span className="hidden items-center gap-1.5 px-2 text-xs text-zinc-500 md:inline-flex">
                        {saveState === "saving" ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Enregistrement…
                            </>
                        ) : saveState === "saved" ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                Enregistré
                            </>
                        ) : (
                            "Modifications…"
                        )}
                    </span>

                    {(draft.status === "DRAFT" || draft.status === "SENT") && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                await persist()
                                setEmailOpen(true)
                            }}
                            className="h-9 border-white/10 bg-white/5 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10 sm:px-4"
                        >
                            <Mail className="h-3.5 w-3.5 sm:mr-1.5" />
                            <span className="hidden sm:inline">Envoyer</span>
                        </Button>
                    )}

                    <Button
                        type="button"
                        onClick={() => void handleDownloadPdf()}
                        disabled={downloading}
                        className="h-9 bg-[#2563EB] px-3 text-xs font-semibold text-white hover:bg-[#2563EB]/90 sm:px-4"
                    >
                        {downloading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin sm:mr-1.5" />
                        ) : (
                            <FileDown className="h-3.5 w-3.5 sm:mr-1.5" />
                        )}
                        <span className="hidden sm:inline">Télécharger PDF</span>
                    </Button>
                </div>
            </header>

            <aside className="hidden h-full w-[280px] shrink-0 pt-16 lg:block">
                <SpecSidebar
                    sections={draft.sections}
                    activeId={activeNodeId}
                    accent={draft.primaryColor}
                    onJump={jumpToNode}
                    onRenameSection={renameSection}
                    onMoveSection={moveSection}
                    onAddSection={addSection}
                    onRemoveSection={removeSection}
                    onAddSubsection={addSubsection}
                />
            </aside>

            <main
                ref={mainRef}
                className="relative h-full min-w-0 flex-1 overflow-auto bg-[#ebe7df] pt-14 sm:pt-16"
            >
                <div className="flex min-w-full justify-center px-3 py-6 pb-28 sm:px-8 sm:py-10">
                    <div
                        className="relative shrink-0"
                        style={{
                            width: Math.round(820 * zoom),
                            height: Math.round(sheetHeight * zoom),
                        }}
                    >
                        <div
                            ref={sheetRef}
                            style={{
                                width: 820,
                                transform: `scale(${zoom})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <SpecLivePreview
                                draft={draft}
                                companyName={companyName}
                                readOnly={viewMode === "preview"}
                                onChange={patchDraft}
                                onFocusItem={setActiveNodeId}
                                onJump={jumpToNode}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Barre inférieure fixe : Édition/Aperçu à gauche (mobile) · Zoom à droite */}
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex items-center justify-between gap-2 border-t border-white/10 bg-zinc-950/95 px-3 py-2.5 backdrop-blur-xl lg:border-t-0 lg:bg-transparent lg:px-6 lg:py-5 lg:backdrop-blur-none">
                <div className="pointer-events-auto flex h-9 items-center rounded-lg border border-white/10 bg-zinc-900 p-0.5 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setViewMode("edit")}
                        className={cn(
                            "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
                            viewMode === "edit"
                                ? "bg-[#2563EB] text-white"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Édition</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("preview")}
                        className={cn(
                            "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
                            viewMode === "preview"
                                ? "bg-[#2563EB] text-white"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Aperçu</span>
                    </button>
                </div>

                <div className="pointer-events-auto ml-auto flex h-9 items-center rounded-lg border border-white/10 bg-zinc-900 px-1 text-zinc-200 shadow-lg">
                    <button
                        type="button"
                        onClick={() =>
                            setZoom((z) => Math.round(Math.max(0.35, z - 0.1) * 100) / 100)
                        }
                        title="Dézoomer"
                        className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setZoom(computeDefaultZoom())}
                        title="Réinitialiser le zoom"
                        className="min-w-[46px] px-1.5 text-center font-mono text-[11px] font-semibold text-zinc-200 hover:text-white"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setZoom((z) => Math.round(Math.min(1.4, z + 0.1) * 100) / 100)
                        }
                        title="Zoomer"
                        className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {drawerOpen && (
                <div className="fixed inset-0 z-[90] lg:hidden">
                    <button
                        type="button"
                        aria-label="Fermer le sommaire"
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-[290px] pt-14">
                        <SpecSidebar
                            sections={draft.sections}
                            activeId={activeNodeId}
                            accent={draft.primaryColor}
                            onJump={jumpToNode}
                            onRenameSection={renameSection}
                            onMoveSection={moveSection}
                            onAddSection={addSection}
                            onRemoveSection={removeSection}
                            onAddSubsection={addSubsection}
                        />
                    </div>
                </div>
            )}

            <SendEmailModal
                open={emailOpen}
                onOpenChange={setEmailOpen}
                documentId={draft.id}
                documentNumber={draft.number || ""}
                clientEmail={draft.clientEmail || ""}
                clientName={draft.clientName || ""}
                documentLabel="cahier des charges"
                sendKind="specification"
                onSent={() => setDraft((prev) => (prev ? { ...prev, status: "SENT" } : prev))}
            />
        </div>
    )
}

function serializeDraft(draft: SpecificationDraft) {
    return JSON.stringify({
        title: draft.title,
        coverStyle: draft.coverStyle,
        primaryColor: draft.primaryColor,
        sections: draft.sections,
    })
}

function CoverPicker({
    selected,
    color,
    onSelect,
}: {
    selected: SpecCover
    color: string
    onSelect: (cover: SpecCover) => void
}) {
    const active = SPEC_COVERS.find((c) => c.id === selected) || SPEC_COVERS[0]
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-zinc-200 hover:bg-white/10"
                >
                    <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="hidden sm:inline">Couverture :</span>
                    <span className="font-semibold text-white">{active.title}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="z-[120] w-[340px] rounded-xl border-white/10 bg-zinc-900 p-3 text-zinc-100 shadow-2xl"
            >
                <DropdownMenuLabel className="px-1 pb-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Modèle de couverture (5)
                </DropdownMenuLabel>
                <SpecCoverGrid selected={selected} color={color} onSelect={onSelect} />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ColorPicker({
    color,
    onChange,
}: {
    color: string
    onChange: (color: string) => void
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 hover:bg-white/10"
                    title="Couleur principale"
                >
                    <span
                        className="h-4 w-4 rounded-full border border-white/25"
                        style={{ backgroundColor: color }}
                    />
                    <span className="hidden font-mono text-[10px] font-bold uppercase text-zinc-300 sm:inline">
                        {color}
                    </span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="z-[120] w-56 rounded-xl border-white/10 bg-zinc-900 p-3 shadow-2xl"
            >
                <DropdownMenuLabel className="px-1 pb-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Couleur principale
                </DropdownMenuLabel>
                <div className="grid grid-cols-5 gap-2">
                    {SPEC_BRAND_COLORS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            title={item.name}
                            onClick={() => onChange(item.value)}
                            className={cn(
                                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                                color.toLowerCase() === item.value.toLowerCase()
                                    ? "border-white"
                                    : "border-transparent"
                            )}
                            style={{ backgroundColor: item.value }}
                        />
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
