"use client"

import { InvoiceHeader } from "@/features/invoices/components/InvoiceHeader"
import { InvoiceList } from "@/features/invoices/components/InvoiceList"
import { useInvoices } from "@/features/invoices/hooks/useInvoices"
import { Button } from "@/components/ui/button"
import { RefreshCcw, FileText, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import Link from "next/link"

export default function InvoicesPage() {
    const queryClient = useQueryClient()
    const { data: invoices, isLoading, error, refetch } = useInvoices()
    const handleDeleteSuccess = () => {
        // Rafraîchir la liste après suppression
        queryClient.invalidateQueries({ queryKey: ['documents'] })
    }

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const hasInvoices = invoices && invoices.length > 0;

    return (
        <div className="flex-1 min-w-0 w-full space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-12 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6 min-h-screen">
            {isLoading ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-[2rem]" />
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white/40 dark:bg-slate-950/40 rounded-3xl border border-rose-500/20 backdrop-blur-xl mt-8">
                    <p className="text-rose-500 font-medium mb-4">Impossible de charger les factures.</p>
                    <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Réessayer
                    </Button>
                </div>
            ) : !hasInvoices ? (
                <div className="flex flex-col items-center justify-center py-32 text-center ">
                    <div className="h-24 w-24 bg-[#2563EB]/10 rounded-[2rem] flex items-center justify-center mb-6 border border-sky-500/20 shadow-xl shadow-sky-500/10 group hover:scale-110 transition-transform duration-500">
                        <FileText className="h-10 w-10 text-[#2563EB]" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        Aucune facture pour le moment
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 text-lg">
                        Commencez par créer votre première facture. Elle sera ajoutée à cette liste et vous pourrez la partager directement avec vos clients.
                    </p>
                    <Link href="/dashboard/invoices/create">
                        <Button className="h-14 px-8 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white rounded-2xl font-bold  text-lg">
                            <Plus className="h-6 w-6 mr-2" />
                            Créer ma première facture
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    <InvoiceHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    <div className="mt-8">
                        <InvoiceList
                            invoices={invoices}
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
