import { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
    title: "Tableau de bord | Sharaco",
    robots: {
        index: false,
        follow: false
    }
}

export default function DashboardServerLayout({ children }: { children: React.ReactNode }) {
    return <ClientLayout>{children}</ClientLayout>
}
