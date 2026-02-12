const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
    token?: string;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((customHeaders as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...rest,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `Request failed with status ${res.status}`);
    }

    return res.json();
}

// ── Auth ───────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'CUSTOMER';
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export function register(data: { name: string; email: string; password: string }) {
    return request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function login(data: { email: string; password: string }) {
    return request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getProfile(token: string) {
    return request<User>('/auth/me', { token });
}

// ── Products ───────────────────────────────────────────────

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
    category: Category;
    reviews?: Review[];
    createdAt: string;
}

export interface ProductsResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ProductQuery {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

export function getProducts(query: ProductQuery = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.set(key, String(value));
        }
    });
    const qs = params.toString();
    return request<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export function getProduct(id: string) {
    return request<Product>(`/products/${id}`);
}

// ── Categories ─────────────────────────────────────────────

export interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
}

export function getCategories() {
    return request<Category[]>('/categories');
}

// ── Reviews ────────────────────────────────────────────────

export interface Review {
    id: string;
    rating: number;
    comment: string;
    user: { id: string; name: string };
    createdAt: string;
}
