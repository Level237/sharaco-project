"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { FileText } from "lucide-react"

interface Document {
    id: string
    reference: string
    type: 'QUOTE' | 'INVOICE'
    status: 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'PAID'
    grand_total_cents: number
    created_at: string
    client?: {
        name: string
    }
}

export function RecentDocuments() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                // Fetch latest quotes to simulate unified documents endpoint for now, or use real endpoint if available
                const reqDocs = await api.get<{ data: Document[] }>('/api/v1/documents?limit=5')
                // Assuming it returns an object with a data array or just the array
                setDocuments(Array.isArray(reqDocs) ? reqDocs as any as Document[] : (reqDocs.data || []))
            } catch (err) {
                setError("Impossible de charger les documents récents.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchDocs()
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return <Badge variant="outline" className="text-slate-500">Brouillon</Badge>
            case 'SENT': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Envoyé</Badge>
            case 'VIEWED': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Consulté</Badge>
            case 'PAID':
            case 'ACCEPTED': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Payé/Accepté</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Documents Récents</CardTitle>
                    <CardDescription className="text-xs">Les 5 derniers devis et factures.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                    <Link href="/quotes">Voir tout</Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {isLoading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-sm text-red-500">{error}</div>
                ) : documents.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                            <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Aucun document</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-6 max-w-[200px] mx-auto">
                            Commencez par créer votre premier devis ou facture pour suivre votre activité.
                        </p>
                        <Button size="sm" variant="outline" className="h-8 text-xs rounded-full" asChild>
                            <Link href="/quotes/new">Nouveau document</Link>
                        </Button>
                    </div>

                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs">Réf</TableHead>
                                    <TableHead className="text-xs">Client</TableHead>
                                    <TableHead className="text-xs">Type</TableHead>
                                    <TableHead className="text-xs">Statut</TableHead>
                                    <TableHead className="text-right text-xs">Montant</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id} className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        <TableCell className="font-medium text-xs">{doc.reference}</TableCell>
                                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                                            {doc.client?.name || "Client Inconnu"}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {doc.type === 'INVOICE' ? 'Facture' : 'Devis'}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(doc.status)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-xs">
                                            {formatCurrency(doc.grand_total_cents)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            {/* Mobile View All Button */}
            <div className="p-4 sm:hidden border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/quotes">Voir tout</Link>
                </Button>
            </div>
        </Card>
    )
}
