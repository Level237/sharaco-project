"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Loader2, PlusCircle, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface NewDocumentMenuProps {
    projectId: string;
    variant?: "header" | "card" | "empty";
}

export function NewDocumentMenu({ projectId, variant = "header" }: NewDocumentMenuProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [creating, setCreating] = useState(false);

    const createQuote = () => {
        router.push(`/dashboard/quotes/create?project_id=${projectId}`);
    };

    const createContract = async () => {
        setCreating(true);
        try {
            const document = await quotesApi.create({
                type: "CONTRAT",
                layout_style: "classic",
                project_id: projectId,
                items: [],
                notes: "",
            });
            router.push(`/dashboard/contracts/${document.id}`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Impossible de créer le contrat.";
            toast({ title: "Erreur", description: message, variant: "destructive" });
            setCreating(false);
        }
    };

    if (variant === "card") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button type="button" className="group flex h-full w-full flex-col outline-none" disabled={creating}>
                        <div className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-transparent transition-all group-hover:border-solid group-hover:border-white/30 group-hover:bg-white/5">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-slate-900">
                                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400">Nouveau document</span>
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <MenuItems onQuote={createQuote} onContract={createContract} />
            </DropdownMenu>
        );
    }

    if (variant === "empty") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-[#2563EB] text-white hover:bg-[#2563EB]/90" disabled={creating}>
                        {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        Nouveau document
                    </Button>
                </DropdownMenuTrigger>
                <MenuItems onQuote={createQuote} onContract={createContract} />
            </DropdownMenu>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="sm"
                    className={cn("h-8 gap-1.5 bg-[#2563EB] px-3 text-xs text-white hover:bg-[#2563EB]/90")}
                    disabled={creating}
                >
                    {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">Nouveau document</span>
                </Button>
            </DropdownMenuTrigger>
            <MenuItems onQuote={createQuote} onContract={createContract} />
        </DropdownMenu>
    );
}

function MenuItems({
    onQuote,
    onContract,
}: {
    onQuote: () => void;
    onContract: () => void;
}) {
    return (
        <DropdownMenuContent align="end" className="w-52 border-white/10 bg-[#111113] text-slate-200">
            <DropdownMenuItem className="cursor-pointer" onClick={onQuote}>
                <FileText className="mr-2 h-4 w-4" />
                Nouveau devis
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={onContract}>
                <ScrollText className="mr-2 h-4 w-4" />
                Nouveau contrat
            </DropdownMenuItem>
        </DropdownMenuContent>
    );
}
