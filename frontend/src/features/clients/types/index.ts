export interface Client {
    id: string;
    name: string;
    email?: string;
    address?: string;
    phone?: string;
    user_id: string;
}

export interface ClientCreate {
    name: string;
    email?: string;
    address?: string;
    phone?: string;
}

export interface ClientUpdate {
    name?: string;
    email?: string;
    address?: string;
    phone?: string;
}
