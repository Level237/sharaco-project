"use client"

import { Activity, FileText, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"

const activities = [
    { id: 1, type: "quote_sent", user: "You", action: "sent a quote to", target: "Acme Corp", time: "2 hours ago", icon: FileText, color: "text-sky-500", bg: "bg-sky-100 dark:bg-sky-900/30" },
    { id: 2, type: "payment", user: "Stripe", action: "received payment from", target: "Globex Inc", time: "5 hours ago", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { id: 3, type: "client_add", user: "Sarah", action: "added new client", target: "TechStart", time: "1 day ago", icon: Users, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
]

export function ActivityFeed() {
    return (
        <Card className="col-span-1 bg-white dark:bg-slate-950 border-border/50 shadow-sm flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-sky-500" />
                    Activity Feed
                </CardTitle>
                <CardDescription>
                    Latest events this week.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="relative pl-6 border-l border-gray-200 dark:border-slate-800 space-y-8">
                    {activities.map((activity) => (
                        <div key={activity.id} className="relative">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[31px] top-1 h-6 w-6 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center ${activity.bg}`}>
                                <activity.icon className={`h-3 w-3 ${activity.color}`} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm">
                                    <span className="font-semibold text-slate-900 dark:text-white">{activity.user}</span>{" "}
                                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                                    <span className="font-medium text-sky-600 dark:text-sky-400">{activity.target}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="relative">
                        <div className="absolute -left-[29px] top-1 h-2 w-2 rounded-full bg-gray-200 dark:bg-slate-800" />
                        <p className="text-xs text-muted-foreground">End of recent activity</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0">
                <Button variant="outline" className="w-full">
                    View All Activity
                </Button>
            </CardFooter>
        </Card>
    )
}
