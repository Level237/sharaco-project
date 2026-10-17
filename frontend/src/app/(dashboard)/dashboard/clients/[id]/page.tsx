"use client";

import { useParams } from "next/navigation";
import { ClientWorkspace } from "@/features/clients/components/ClientWorkspace";

export default function ClientPage() {
    const params = useParams();
    const clientId = params.id as string;
    return <ClientWorkspace clientId={clientId} />;
}
