// features/projects/hooks/useCreateProjectModal.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/features/clients/api/clientsApi';
import { useCreateProject } from './useProject';

export function useCreateProjectModal() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const createMutation = useCreateProject();

    // Charger les clients pour le select
    const { data: clients = [] } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientsApi.getAll(),
        enabled: isOpen,
    });

    const handleCreate = async (data: {
        name: string;
        description?: string;
        client_id: string;
        budget_cents?: number;
    }) => {
        try {
            const project = await createMutation.mutateAsync(data);
            setIsOpen(false);
            // Optionnel : rediriger vers le projet créé
            // router.push(`/dashboard/projects/${project.id}`);
        } catch (error) {
            console.error('Erreur création:', error);
        }
    };

    return {
        isOpen,
        setIsOpen,
        clients,
        handleCreate,
        isCreating: createMutation.isPending,
    };
}