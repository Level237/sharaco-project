"use client"

import { Filter, ArrowRight, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const recentQuotes = [
    {
        id: "Q-1024",
        client: "Acme Corp",
        amount: "$2,500.00",
        status: "Accepted",
        date: "2024-02-12",
        avatar: "/avatars/01.png",
        initials: "AC"
    },
    {
        id: "Q-1023",
        client: "Globex Inc",
        amount: "$5,350.50",
        status: "Sent",
        date: "2024-02-11",
        avatar: "/avatars/02.png",
        initials: "GL"
    },
    {
        id: "Q-1022",
        client: "Soylent Corp",
        amount: "$950.00",
        status: "Draft",
        date: "2024-02-10",
        avatar: "/avatars/03.png",
        initials: "SC"
    },
    {
        id: "Q-1021",
        client: "Initech",
        amount: "$12,000.00",
        status: "Rejected",
        date: "2024-02-09",
        avatar: "/avatars/04.png",
        initials: "IN"
    },
    {
        id: "Q-1020",
        client: "Umbrella Corp",
        amount: "$6,500.00",
        status: "Sent",
        date: "2024-02-08",
        avatar: "/avatars/05.png",
        initials: "UC"
    },
]

export function QuotesHistory() {
    return (
        <Card className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-950 border-border/50 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle>Quotes History</CardTitle>
                    <CardDescription>
                        Manage your recent quotes and invoices.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex h-8">
                        <Filter className="mr-2 h-3.5 w-3.5" />
                        Filter
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-sky-600 dark:text-sky-400">
                        View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[100px]">Invoice</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentQuotes.map((quote) => (
                            <TableRow key={quote.id} className="hover:bg-muted/50 cursor-pointer transition-colors group">
                                <TableCell className="font-medium">{quote.id}</TableCell>
                                <TableCell className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">{quote.initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{quote.client}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={`
                                    ${quote.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                quote.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                                                    quote.status === 'Sent' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}
                                    `}
                                    >
                                        {quote.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{quote.date}</TableCell>
                                <TableCell className="text-right font-bold text-slate-700 dark:text-slate-200">{quote.amount}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
