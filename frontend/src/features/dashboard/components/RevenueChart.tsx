"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyRevenue } from "@/features/dashboard/types"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"

interface RevenueChartProps {
    data: MonthlyRevenue[]
}

const formatMonth = (monthString: string) => {
    if (!monthString) return "";
    const date = new Date(monthString + "-01");
    // Format to short french month, e.g., "Jan", "Fév"
    return new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(date);
}

export function RevenueChart({ data }: RevenueChartProps) {
    const chartData = data && data.length > 0 ? data : [];
    
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="relative overflow-hidden border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem] group transition-all duration-500">
                <CardHeader className="p-8 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-emerald-500/10">
                                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                                </div>
                                Monthly Revenue
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                                Cash flow analytics — 12 Months
                            </CardDescription>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-400">Live Status</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-6">
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                                <XAxis
                                    dataKey="month"
                                    stroke="currentColor"
                                    className="text-slate-400 dark:text-slate-600"
                                    fontSize={10}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatMonth}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="currentColor"
                                    className="text-slate-400 dark:text-slate-600"
                                    fontSize={10}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-2xl border border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 shadow-2xl">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                                                        {formatMonth(label)}
                                                    </p>
                                                    <p className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">
                                                        {formatCurrency(payload[0].value as number)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue_cents"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
