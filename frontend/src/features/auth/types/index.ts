export interface User {
    id: string;
    email: string;
    full_name?: string;
    company_name?: string;
    address?: string;
    tax_id?: string;
    payment_info?: string;
}

export interface LoginRequest {
    username: string; // email - FastAPI OAuth2 uses 'username'
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterRequest {
    full_name: string;
    phone?: string;
    email: string;
    password: string;
    company_name?: string;
}
