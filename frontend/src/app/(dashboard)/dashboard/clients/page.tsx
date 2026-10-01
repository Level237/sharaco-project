"use client";

import { useState } from "react";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientList } from "@/features/clients/components/ClientList";
import { CreateClientModal } from "@/features/clients/components/CreateClientModal";

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="flex-1 min-w-0 w-full space-y-8 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl max-sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                        <div className="p-2.5 bg-[#2563EB]/20 rounded-lg border border-[#2563EB]/10">
                            <Users className="w-8 h-8 max-sm:w-4 max-sm:h-4 text-[#2563EB]" />
                        </div>
                        Mes Clients
                    </h1>
                    <p className="text-slate-400 max-sm:text-sm mt-2">
                        Gérez votre répertoire client et leurs coordonnées.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#2563EB] hover:bg-[#2563EB]/70 cursor-pointer text-white rounded-lg shadow-[0_8px_20px_rgba(99,102,241,0.25)] transition-all hover:-translate-y-0.5 h-12 px-6 font-bold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau Client
                </Button>
            </div>

            {/* Barre de recherche */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                    placeholder="Rechercher un client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 max-sm:text-sm h-14 bg-white/[0.02] border-white/5 rounded-lg shadow-sm focus:ring-2 focus:ring-[#2563EB]/50 text-base"
                />
            </div>

            <ClientList searchQuery={searchQuery} />
            
            <CreateClientModal 
                open={isCreateModalOpen} 
                onOpenChange={setIsCreateModalOpen} 
            />
        </div>
    );
}