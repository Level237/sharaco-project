// app/dashboard/quotes/page.tsx
"use client"

import { QuoteHeader } from "@/features/quotes/components/QuoteHeader"
import { QuoteList } from "@/features/quotes/components/QuoteList"
import { useQuotes } from "@/features/quotes/hooks/useQuotes"
import { Button } from "@/components/ui/button"
import { RefreshCcw, FileText, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import Link from "next/link"

export default function QuotesPage() {
    const queryClient = useQueryClient()
    const { data: quotes, isLoading, error, refetch } = useQuotes()
    const handleDeleteSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['documents'] })
    }

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const hasQuotes = quotes && quotes.length > 0;

    return (
        <div className="flex-1 min-w-0 w-full space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-12 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6 min-h-screen">
            {isLoading ? (
                /* ═══════════ SKELETON LOADING ═══════════ */
                <div className="mt-4 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="space-y-2 sm:space-y-3">
                            <Skeleton className="w-full aspect-[4/5] rounded-lg" />
                            <Skeleton className="h-3 sm:h-4 w-3/4 rounded-md mx-1" />
                            <Skeleton className="h-2.5 sm:h-3 w-full sm:w-1/2 rounded-md mx-1" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                /* ═══════════ ERROR STATE ═══════════ */
                <div className="flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 text-center bg-slate-950/40 rounded-lg border border-rose-500/20 backdrop-blur-xl mt-4 sm:mt-8">
                    <p className="text-rose-500 font-medium mb-3 sm:mb-4 text-sm sm:text-base px-4">
                        Impossible de charger les devis.
                    </p>
                    <Button onClick={() => refetch()} variant="outline" className="rounded-lg h-10 sm:h-11 px-4">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Réessayer
                    </Button>
                </div>
            ) : !hasQuotes ? (
                /* ═══════════ EMPTY STATE ═══════════ */
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 md:py-32 text-center px-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-[#2563EB]/10 flex items-center justify-center mb-4 sm:mb-6 border border-blue-500/20 shadow-xl shadow-blue-500/10 group hover:scale-105 transition-transform duration-300">
                        <FileText className="h-7 w-7 sm:h-8 sm:h-8 text-[#2563EB]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-3 sm:mb-4">
                        Aucun devis pour le moment
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-md mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed">
                        Commencez par créer votre premier devis. Il sera ajouté à cette liste et vous pourrez le partager directement avec vos clients.
                    </p>
                    <Link href="/dashboard/quotes/create">
                        <Button className="h-12 sm:h-14 px-5 sm:px-6 md:px-8 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white rounded-lg sm:rounded-lg font-bold text-sm sm:text-base md:text-lg">
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1.5 sm:mr-2" />
                            Créer mon premier devis
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <QuoteHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    <div className="mt-4 sm:mt-6 md:mt-8">
                        <QuoteList
                            quotes={quotes}
                            onDeleteSuccess={handleDeleteSuccess}
                            searchQuery={searchQuery}
                            statusFilter={statusFilter}
                        />
                    </div>
                </>
            )}
        </div>
    )
}