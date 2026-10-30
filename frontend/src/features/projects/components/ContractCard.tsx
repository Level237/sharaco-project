"use client"

import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { Eye, FileDown, Mail, MoreVertical, Pencil, ScrollText, Trash2 } from "lucide-react"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal"
import { useState } from "react"
import type { ProjectTreeContract } from "../types"
import { contractKindMeta } from "@/features/contracts/kinds"
import { contractDetailHref, contractEditHref } from "@/features/contracts/paths"

interface ContractCardProps {
    contract: ProjectTreeContract;
    variants?: Variants;
    onRefresh?: () => void;
    clientEmail?: string | null;
    clientName?: string | null;
}

const statusLabel: Record<string, string> = {
    DRAFT: "Brouillon",
    SENT: "Envoyé",
    VIEWED: "Consulté",
    ACCEPTED: "Signé",
    REFUSED: "Refusé",
}

export function ContractCard({ contract, variants, onRefresh, clientEmail, clientName }: ContractCardProps) {
    const [emailOpen, setEmailOpen] = useState(false);
    const canSend = contract.status === "DRAFT" || contract.status === "SENT";
    const kind = contractKindMeta(contract.layout_style);

    const handleDownloadPdf = async () => {
        await quotesApi.downloadPdf(contract.id, `${contract.number || "contrat"}.pdf`);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Supprimer le contrat « ${contract.number || ""} » ?\n\nCette action est irréversible.`)) {
            return;
        }
        await quotesApi.delete(contract.id);
        onRefresh?.();
    };

    return (
        <motion.div variants={variants} initial="hidden" animate="show" layout className="group flex flex-col">
            <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                <Link href={contractDetailHref(contract.id)} className="relative block h-full w-full overflow-hidden rounded-md bg-slate-950/50 shadow-sm">
                    <DocumentPreview documentId={contract.id} layoutStyle={contract.layout_style || "prestation"} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                </Link>

                <div className="absolute right-2 top-2 z-20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 rounded-md border border-white/10 bg-black/40 text-slate-200 shadow-lg backdrop-blur-md hover:bg-black/60"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#111113] p-2 text-slate-200">
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={contractDetailHref(contract.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualiser
                                </Link>
                            </DropdownMenuItem>
                            {contract.status !== "ACCEPTED" && (
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={contractEditHref(contract.id)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Modifier
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer" onClick={handleDownloadPdf}>
                                <FileDown className="mr-2 h-4 w-4 text-blue-500" />
                                Télécharger PDF
                            </DropdownMenuItem>
                            {canSend && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setEmailOpen(true)}>
                                    <Mail className="mr-2 h-4 w-4 text-emerald-400" />
                                    Envoyer par email
                                </DropdownMenuItem>
                            )}
                            {contract.status === "DRAFT" && (
                                <DropdownMenuItem className="cursor-pointer text-rose-400 focus:text-rose-300" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer le contrat
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="mt-3 px-1">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-white">
                    <ScrollText className="h-3.5 w-3.5 text-[#2563EB]" />
                    {contract.number || "Contrat"}
                </h4>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                    {kind.title} · {statusLabel[contract.status] || contract.status}
                    {contract.amount_cents > 0 ? ` · ${formatCurrency(contract.amount_cents)}` : ""}
                </div>
            </div>

            <SendEmailModal
                open={emailOpen}
                onOpenChange={setEmailOpen}
                documentId={contract.id}
                documentNumber={contract.number || ""}
                clientEmail={clientEmail || ""}
                clientName={clientName || ""}
                documentLabel="contrat"
                onSent={onRefresh}
            />
        </motion.div>
    );
}
