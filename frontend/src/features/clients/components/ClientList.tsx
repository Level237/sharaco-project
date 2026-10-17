"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { useClients, useDeleteClient } from "../hooks/useClients";
import { ClientCharacter } from "./ClientCharacter";
import { UpdateClientModal } from "./UpdateClientModal";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Client } from "../types";

interface ClientListProps {
    searchQuery: string;
}

export function ClientList({ searchQuery }: ClientListProps) {
    const router = useRouter();
    const { data: clients = [], isLoading } = useClients();
    const { mutate: deleteClient } = useDeleteClient();
    const [clientToUpdate, setClientToUpdate] = useState<Client | null>(null);

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openClient = (id: string) => router.push(`/dashboard/clients/${id}`);

    const handleDelete = (client: Client) => {
        if (window.confirm(`Supprimer le client « ${client.name} » ?`)) {
            deleteClient(client.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
        );
    }

    if (filteredClients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users className="mb-4 h-10 w-10 text-slate-500" />
                <h3 className="text-lg font-bold text-white">Aucun client trouvé</h3>
                <p className="mt-1 text-sm text-slate-400">
                    {searchQuery ? "Essaie avec d'autres mots." : "Ajoute un premier client."}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-6">
                {filteredClients.map((client) => (
                    <ContextMenu key={client.id}>
                        <ContextMenuTrigger asChild>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => openClient(client.id)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        openClient(client.id);
                                    }
                                }}
                                className="group flex w-full min-w-0 cursor-pointer flex-col rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                            >
                                <div className="relative w-full min-w-0 pt-1.5 sm:pt-2">
                                    <div className="absolute left-0 top-0 h-4 w-[38%] rounded-t-md bg-[#1e293b] transition-colors duration-200 group-hover:bg-[#334155] sm:h-5 sm:w-[42%]" />
                                    <div className="relative z-10 flex aspect-square w-full min-w-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[#14161c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-[#2563EB]/40 sm:aspect-[5/4] sm:rounded-lg">
                                        <ClientCharacter className="aspect-square w-[70%] max-w-14 sm:w-[44%] sm:max-w-16 lg:max-w-[4.5rem]" />
                                    </div>
                                </div>
                                <span className="mt-1.5 line-clamp-2 px-0.5 text-xs font-semibold leading-tight text-white sm:mt-2 sm:text-sm">
                                    {client.name}
                                </span>
                            </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-56 border-white/10 bg-[#111113] text-slate-200">
                            <ContextMenuItem onClick={() => openClient(client.id)}>
                                Ouvrir
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => setClientToUpdate(client)}>
                                Modifier les infos
                            </ContextMenuItem>
                            <ContextMenuSeparator className="bg-white/10" />
                            <ContextMenuItem
                                className="text-rose-400 focus:text-rose-300"
                                onClick={() => handleDelete(client)}
                            >
                                Supprimer
                            </ContextMenuItem>
                        </ContextMenuContent>
                    </ContextMenu>
                ))}
            </div>

            <UpdateClientModal
                open={!!clientToUpdate}
                onOpenChange={(open) => !open && setClientToUpdate(null)}
                client={clientToUpdate}
            />
        </>
    );
}
