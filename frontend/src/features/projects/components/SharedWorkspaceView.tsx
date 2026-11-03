"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import Logo from "@/components/ui/logo"
import { API_URL } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { SharedWorkspace, SharedWorkspaceItem } from "../api/projectsApi"

function kindLabel(kind: string) {
    if (kind === "FACTURE") return "Facture"
    if (kind === "CONTRAT") return "Contrat"
    if (kind === "CDC") return "Cahier des charges"
    if (kind === "DEVIS") return "Devis"
    return kind
}

function itemHref(item: SharedWorkspaceItem) {
    if (item.href) return item.href
    if (item.pdf_url) return `${API_URL}${item.pdf_url}`
    return null
}

function SharedProjectFolder({
    name,
    clientName,
    filled,
    onOpen,
}: {
    name: string
    clientName?: string | null
    filled: boolean
    onOpen: () => void
}) {
    return (
        <button type="button" onClick={onOpen} className="group flex w-full flex-col text-left">
            <div className="relative w-full pt-2 sm:pt-3">
                <div className="absolute left-0 top-0 h-6 w-[40%] rounded-t-md bg-slate-800/80 transition-colors duration-300 group-hover:bg-slate-700 sm:h-8 sm:w-[45%] sm:rounded-t-lg" />
                <div
                    className={cn(
                        "relative z-10 flex aspect-[5/4] w-full items-center justify-center rounded-md border border-white/5 bg-[#1a1a1a] transition-all duration-300 md:aspect-[4/3] sm:rounded-lg",
                        "group-hover:-translate-y-1 group-hover:shadow-lg"
                    )}
                >
                    {filled ? (
                        <div className="relative h-[58%] w-[52%]">
                            <span className="absolute inset-0 origin-bottom rotate-[-11deg] rounded-[3px] bg-white/70 shadow-[0_8px_18px_rgba(0,0,0,0.35)]" />
                            <span className="absolute inset-0 origin-bottom rotate-[-4deg] rounded-[3px] bg-white/85 shadow-[0_8px_18px_rgba(0,0,0,0.28)]" />
                            <span className="absolute inset-0 origin-bottom rotate-[5deg] rounded-[3px] bg-white shadow-[0_10px_22px_rgba(0,0,0,0.32)]">
                                <span className="absolute inset-x-2 top-2 h-px bg-slate-200" />
                                <span className="absolute inset-x-2 top-3.5 h-px bg-slate-200" />
                                <span className="absolute inset-x-2 top-5 h-px w-2/3 bg-slate-200" />
                            </span>
                        </div>
                    ) : (
                        <FileText className="h-8 w-8 text-slate-500" strokeWidth={1.5} />
                    )}
                </div>
            </div>
            <div className="ml-0.5 mt-2 space-y-0.5 sm:ml-1 sm:mt-3 sm:space-y-1">
                <span className="block line-clamp-1 text-xs font-bold tracking-wide text-white sm:text-sm">{name}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 sm:gap-2 sm:text-xs">
                    {clientName ? <span className="line-clamp-1 min-w-0 flex-1">{clientName}</span> : null}
                </div>
            </div>
        </button>
    )
}

function SharedDocumentCard({ item }: { item: SharedWorkspaceItem }) {
    const href = itemHref(item)
    const previewSrc = item.preview_url ? `${API_URL}${item.preview_url}` : null
    const [imgState, setImgState] = useState<"loading" | "ready" | "error">(previewSrc ? "loading" : "error")
    const inner = (
        <>
            <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                <div className="relative h-full w-full overflow-hidden rounded-md bg-slate-950/50 shadow-sm">
                    {previewSrc && imgState !== "error" ? (
                        <img
                            src={previewSrc}
                            alt=""
                            className="h-full w-full object-cover object-top"
                            onLoad={() => setImgState("ready")}
                            onError={() => setImgState("error")}
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-white px-3">
                            <FileText className="mb-2 h-8 w-8 text-slate-300" strokeWidth={1.5} />
                            <span className="line-clamp-3 text-center text-[11px] font-semibold text-slate-700">{item.title}</span>
                        </div>
                    )}
                    {imgState === "loading" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : null}
                </div>
            </div>
            <span className="mt-2 line-clamp-1 text-xs font-medium text-slate-200">{item.title}</span>
            <span className="text-[11px] text-slate-500">{kindLabel(item.kind)}</span>
        </>
    )

    if (!href) {
        return <div className="group flex flex-col">{inner}</div>
    }
    if (href.startsWith("http")) {
        return (
            <a href={href} target="_blank" rel="noreferrer" className="group flex flex-col">
                {inner}
            </a>
        )
    }
    return (
        <Link href={href} className="group flex flex-col">
            {inner}
        </Link>
    )
}

export function SharedWorkspaceView({ data }: { data: SharedWorkspace }) {
    const [opened, setOpened] = useState(false)
    const filled = data.items.length > 0

    return (
        <div className="min-h-dvh bg-[#0a0a0a] text-slate-100">
            <header className="border-b border-white/10">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
                    <Logo width={110} height={28} />
                    {data.company_name ? (
                        <p className="truncate text-xs text-slate-400">{data.company_name}</p>
                    ) : null}
                </div>
            </header>

            <div className="mx-auto w-full max-w-6xl min-w-0 flex-1 space-y-8 p-4 pt-6 md:p-8">
                {opened ? (
                    <>
                        <div>
                            <button
                                type="button"
                                onClick={() => setOpened(false)}
                                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Projets
                            </button>
                            <h1 className="truncate text-3xl font-black tracking-tight text-white max-sm:text-2xl">
                                {data.project_name}
                            </h1>
                            {data.client_name ? (
                                <p className="mt-1 text-sm text-slate-400">{data.client_name}</p>
                            ) : null}
                        </div>
                        {filled ? (
                            <div className="grid grid-cols-2 gap-3 min-[500px]:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-4 md:gap-6">
                                {data.items.map((item) => (
                                    <SharedDocumentCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-slate-400">
                                Aucun document envoyé pour le moment.
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <div>
                            <p className="mb-3 text-sm font-semibold text-slate-400">Espace projet</p>
                            <h1 className="truncate text-3xl font-black tracking-tight text-white max-sm:text-2xl">
                                {data.company_name || "Documents partagés"}
                            </h1>
                            {data.client_name ? (
                                <p className="mt-1 text-sm text-slate-400">Pour {data.client_name}</p>
                            ) : null}
                        </div>
                        <section>
                            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Projets</h2>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                <SharedProjectFolder
                                    name={data.project_name}
                                    clientName={data.client_name}
                                    filled={filled}
                                    onOpen={() => setOpened(true)}
                                />
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}
