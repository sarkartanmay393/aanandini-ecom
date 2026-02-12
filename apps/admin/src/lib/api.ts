const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
    token?: string;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
        ...((customHeaders as Record<string, string>) || {}),
    };

    // Only set content-type for non-FormData bodies
    if (!(rest.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

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
    category?: Category;
    createdAt: string;
}

export interface ProductsResponse {
    data: Product[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export function getProducts(token: string, query: Record<string, string | number> = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`, { token });
}

export function getProduct(token: string, id: string) {
    return request<Product>(`/products/${id}`, { token });
}

export function createProduct(token: string, data: Partial<Product>) {
    return request<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
    });
}

export function updateProduct(token: string, id: string, data: Partial<Product>) {
    return request<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
    });
}

export function deleteProduct(token: string, id: string) {
    return request<void>(`/products/${id}`, { method: 'DELETE', token });
}

// ── Categories ─────────────────────────────────────────────

export interface Category {
    id: string;
    name: string;
    slug: string;
    _count?: { products: number };
}

export function getCategories(token: string) {
    return request<Category[]>('/categories', { token });
}

// ── Orders ─────────────────────────────────────────────────

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; images: string[] };
}

export interface Order {
    id: string;
    status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
    total: number;
    user: { id: string; name: string; email: string };
    items: OrderItem[];
    createdAt: string;
}

export interface OrdersResponse {
    data: Order[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export function getOrders(token: string, query: Record<string, string | number> = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return request<OrdersResponse>(`/orders${qs ? `?${qs}` : ''}`, { token });
}

export function updateOrderStatus(token: string, id: string, status: string) {
    return request<Order>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        token,
    });
}

// ── Stats ──────────────────────────────────────────────────

export interface DashboardStats {
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalRevenue: number;
    pendingOrders: number;
}

export function getStats(token: string) {
    return request<DashboardStats>('/orders/stats', { token });
}
