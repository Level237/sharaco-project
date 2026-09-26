"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react"
import { ResponsiveContainer, LineChart, Line } from "recharts"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface KPICardProps {
    title: string
    value: string | number
    description?: string
    change?: string
    trend?: 'up' | 'down'
    icon: LucideIcon
    iconColorClass?: string
    iconBgClass?: string
    data?: any[]
    strokeColor?: string
    valueColorClass?: string
}

export function KPICard({ 
    title, 
    value, 
    description,
    change, 
    trend, 
    icon: Icon, 
    iconColorClass = "text-sky-500", 
    iconBgClass = "bg-sky-500/10",
    data, 
    strokeColor = "#0ea5e9",
    valueColorClass
}: KPICardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <Card className="relative overflow-hidden border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl group transition-all duration-300">
                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {title}
                            </p>
                            <h3 className={cn(
                                "text-2xl font-black tracking-tighter text-slate-900 dark:text-white",
                                valueColorClass
                            )}>
                                {value}
                            </h3>
                            
                            {(description || change) && (
                                <div className="flex items-center gap-1.5 pt-1">
                                    {trend && (
                                        <div className={cn(
                                            "flex items-center justify-center rounded-full p-0.5",
                                            trend === 'up' ? "bg-emerald-500/10" : "bg-rose-500/10"
                                        )}>
                                            {trend === 'up' ? (
                                                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                            ) : (
                                                <ArrowDownRight className="h-3 w-3 text-rose-500" />
                                            )}
                                        </div>
                                    )}
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        {change && <span className={cn(
                                            "font-bold mr-1",
                                            trend === 'up' ? "text-emerald-500" : "text-rose-500"
                                        )}>{change}</span>}
                                        {description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className={cn(
                            "p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                            iconBgClass
                        )}>
                            <Icon className={cn("h-5 w-5", iconColorClass)} />
                        </div>
                    </div>

                    {/* Tiny Sparkline if data is provided */}
                    {data && data.length > 0 && (
                        <div className="h-[40px] w-full mt-4 -mx-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={strokeColor}
                                        strokeWidth={2.5}
                                        dot={false}
                                        animationDuration={2000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
