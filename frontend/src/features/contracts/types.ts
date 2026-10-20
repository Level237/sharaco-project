export interface ContractRule {
    title: string;
    body: string;
}

export interface ContractDraft {
    id: string;
    number: string;
    status?: string;
    projectId?: string | null;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    clientPhone: string;
    notes: string;
    endDate: string;
    items: { id: string; description: string }[];
    rules: ContractRule[];
}
