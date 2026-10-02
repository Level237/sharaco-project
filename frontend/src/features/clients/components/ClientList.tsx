"use client";

import { useClients, useDeleteClient } from "../hooks/useClients";
import { User, Phone, Mail, MapPin, MoreVertical, Edit2, Trash2, Loader2, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { UpdateClientModal } from "./UpdateClientModal";
import { Client } from "../types";

interface ClientListProps {
    searchQuery: string;
}

export function ClientList({ searchQuery }: ClientListProps) {
    const { data: clients = [], isLoading } = useClients();
    const { mutate: deleteClient } = useDeleteClient();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [clientToUpdate, setClientToUpdate] = useState<Client | null>(null);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${name}" ?`)) {
            setDeletingId(id);
            deleteClient(id, {
                onSettled: () => setDeletingId(null)
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin opacity-50" />
            </div>
        );
    }

    if (filteredClients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-3xl mt-6">
                <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                    <Users className="h-10 w-10 max-sm:h-3 max-sm:w-3 text-indigo-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Aucun client trouvé</h3>
                <p className="text-slate-400">
                    {searchQuery ? "Essayez avec d'autres mots-clés." : "Commencez par ajouter votre premier client."}
                </p>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    return (
        <div
          
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6"
        >
            
                {filteredClients.map((client) => (
                    <div
                        key={client.id}
                        className={cn(
                            "group relative bg-[#111113] rounded-lg p-5 sm:p-6 border border-white/5 min-w-0",
                            "hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-500",
                            deletingId === client.id && "opacity-50 pointer-events-none scale-95"
                        )}
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#2563EB]/10 via-transparent to-transparent rounded-lg pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-14 w-14 max-sm:h-10 max-sm:w-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                    <User className="h-7 w-7 max-sm:h-5 max-sm:w-5 text-[#2563EB]" />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8 rounded-md hover:bg-white/10 text-slate-400 hover:text-white">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 rounded-lg border-white/10 shadow-xl bg-[#111113]">
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer rounded-md font-medium focus:bg-white/5"
                                            onClick={() => setClientToUpdate(client)}
                                        >
                                            <Edit2 className="h-4 w-4 text-[#2563EB]" />
                                            Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer rounded-md font-medium text-rose-500 focus:bg-rose-500/10 focus:text-rose-400"
                                            onClick={() => handleDelete(client.id, client.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="mb-4">
                                    <h3 className="text-xl font-black text-white line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                                        {client.name}
                                    </h3>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/5 mt-auto">
                                    {client.email ? (
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 shrink-0">
                                                <Mail className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate">{client.email}</span>
                                        </div>
                                    ) : null}

                                    {client.phone ? (
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 shrink-0">
                                                <Phone className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate">{client.phone}</span>
                                        </div>
                                    ) : null}

                                    {client.address ? (
                                        <div className="flex items-start gap-3 text-sm text-slate-400">
                                            <div className="p-1.5 bg-white/5 rounded-lg text-slate-400 shrink-0">
                                                <MapPin className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="line-clamp-2">{client.address}</span>
                                        </div>
                                    ) : null}

                                    {(!client.email && !client.phone && !client.address) && (
                                        <p className="text-sm text-slate-500 italic">
                                            Aucune coordonnée
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
           

            <UpdateClientModal
                open={!!clientToUpdate}
                onOpenChange={(open) => !open && setClientToUpdate(null)}
                client={clientToUpdate}
            />
        </div>
    );
}
