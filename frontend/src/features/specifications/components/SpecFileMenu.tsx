"use client"

import { ChevronDown, FileDown, Loader2, Mail, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { SPEC_BRAND_COLORS } from "../brandColors"
import { SPEC_COVERS, type SpecCover } from "../covers"
import { SpecCoverGrid } from "./SpecCoverGrid"

export function SpecFileMenu({
    label,
    coverStyle,
    color,
    canSend,
    downloading,
    onCoverChange,
    onColorChange,
    onSend,
    onDownload,
    align = "start",
    variant = "file",
}: {
    label: string
    coverStyle: SpecCover
    color: string
    canSend: boolean
    downloading: boolean
    onCoverChange: (cover: SpecCover) => void
    onColorChange: (color: string) => void
    onSend: () => void
    onDownload: () => void
    align?: "start" | "end"
    variant?: "file" | "dots"
}) {
    const coverTitle = SPEC_COVERS.find((c) => c.id === coverStyle)?.title || "Dossier"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {variant === "dots" ? (
                    <button
                        type="button"
                        title="Fichier"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="flex h-9 w-full min-w-0 items-center gap-1.5 rounded-lg px-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5"
                    >
                        <span className="truncate font-semibold text-white">{label}</span>
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={align}
                sideOffset={8}
                className="z-[120] w-56 rounded-xl border-white/10 bg-zinc-900 p-1.5 text-zinc-100 shadow-2xl"
            >
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-lg px-2.5 py-2 text-sm focus:bg-white/8 data-[state=open]:bg-white/8">
                        Couverture
                        <span className="ml-auto mr-1 text-[11px] text-zinc-500">{coverTitle}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="z-[130] w-[300px] rounded-xl border-white/10 bg-zinc-900 p-3 text-zinc-100 shadow-2xl">
                        <p className="px-0.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            Modèle
                        </p>
                        <SpecCoverGrid selected={coverStyle} color={color} onSelect={onCoverChange} />
                        <p className="px-0.5 pb-2 pt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            Couleur
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                            {SPEC_BRAND_COLORS.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    title={item.name}
                                    onClick={() => onColorChange(item.value)}
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
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {canSend && (
                    <DropdownMenuItem
                        className="rounded-lg px-2.5 py-2 text-sm focus:bg-white/8"
                        onSelect={onSend}
                    >
                        <Mail className="mr-2 h-4 w-4 text-zinc-400" />
                        Envoyer au client
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-white/8" />

                <DropdownMenuItem
                    disabled={downloading}
                    className="rounded-lg px-2.5 py-2 text-sm focus:bg-white/8"
                    onSelect={onDownload}
                >
                    {downloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
                    ) : (
                        <FileDown className="mr-2 h-4 w-4 text-zinc-400" />
                    )}
                    Télécharger PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
