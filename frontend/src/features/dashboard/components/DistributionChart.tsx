"use client"

import { PieChart as PieChartIcon } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DistributionChartProps {
    draft: number
    sent: number
    viewed: number
    paid: number
}

const COLORS = {
    Brouillon: "#94a3b8", // slate
    Envoyé: "#3b82f6",    // blue
    Consulté: "#f59e0b",  // amber
    Payé: "#10b981",      // emerald
}

export function DistributionChart({ draft, sent, viewed, paid }: DistributionChartProps) {
    const distributionData = [
        { name: "Draft", value: draft, color: COLORS.Brouillon },
        { name: "Sent", value: sent, color: COLORS.Envoyé },
        { name: "Viewed", value: viewed, color: COLORS.Consulté },
        { name: "Paid", value: paid, color: COLORS.Payé },
    ].filter(item => item.value >= 0);

    const total = draft + sent + viewed + paid;

    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 mt-8">
                {payload.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center group cursor-default">
                        <div className="w-2.5 h-2.5 rounded-full mr-2.5 shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: entry.color }} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{entry.value}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{entry.payload.value}</span>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
        >
            <Card className="h-full relative overflow-hidden border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem] flex flex-col">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10">
                            <PieChartIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                        Documents
                    </CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                        Status Distribution
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 flex flex-col items-center justify-center flex-1">
                    <div className="h-[220px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={500}
                                    animationDuration={1500}
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color}
                                            className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-2xl border border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 shadow-2xl">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                                        {payload[0].name}
                                                    </p>
                                                    <p className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">
                                                        {payload[0].value} <span className="text-sm font-medium text-slate-400 ml-1">Quotes</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{total}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1">Total</span>
                        </div>
                    </div>
                    <div className="w-full">
                        <Legend content={renderLegend} verticalAlign="bottom" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
