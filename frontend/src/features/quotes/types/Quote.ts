export interface Quote {
    id: string;
    clientName: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    date: string;
    avatarUrl?: string;
    initials: string;
}
