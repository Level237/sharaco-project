export default function ClientPortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <div className="min-h-[100dvh] bg-zinc-950 text-slate-50 antialiased">{children}</div>
}
