export interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    is_approved: boolean;
    role: string;
    created_at: string;
}

export interface Lead {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    status: string | null;
    notes: string | null;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    active: boolean;
}

export interface Sale {
    id: string;
    lead_id: string;
    user_id: string;
    total_amount: number;
    sale_date: string;
    status: string | null;
    notes: string | null;
}
