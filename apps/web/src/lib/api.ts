const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Types ────────────────────────────────────────────────────

export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    videos: string[];
    slug: string;
    categoryId: string;
    category: Category;
    reviews: { id: string; rating: number; comment: string; user: { name: string }; createdAt: string }[];
    createdAt: string;
};

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    _count?: { products: number };
};

export type ProductsResponse = {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type User = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: 'CUSTOMER' | 'ADMIN';
    createdAt: string;
};

// ── Helpers ──────────────────────────────────────────────────

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || 'Request failed');
    }

    return res.json();
}

function authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
}

// ── Auth ─────────────────────────────────────────────────────

export async function login(email: string, password: string) {
    return fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function register(name: string, email: string, password: string) {
    return fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export async function sendOtp(phone: string) {
    return fetchApi('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    });
}

export async function verifyOtp(phone: string, code: string) {
    return fetchApi('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
    });
}

export async function getProfile(token: string) {
    return fetchApi('/auth/me', {
        headers: authHeaders(token),
    });
}

export async function updateProfile(token: string, data: { name?: string; phone?: string; email?: string }) {
    return fetchApi('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: authHeaders(token),
    });
}

// ── Addresses ────────────────────────────────────────────────

export async function getAddresses(token: string) {
    return fetchApi('/auth/me/addresses', {
        headers: authHeaders(token),
    });
}

export async function createAddress(token: string, data: {
    label?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    isDefault?: boolean;
}) {
    return fetchApi('/auth/me/addresses', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: authHeaders(token),
    });
}

export async function updateAddress(token: string, id: string, data: Record<string, any>) {
    return fetchApi(`/auth/me/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: authHeaders(token),
    });
}

export async function deleteAddress(token: string, id: string) {
    return fetchApi(`/auth/me/addresses/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });
}

// ── Orders (Customer) ───────────────────────────────────────

export async function createOrder(token: string, data: {
    items: { productId: string; quantity: number }[];
    shippingAddressId: string;
}) {
    return fetchApi('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: authHeaders(token),
    });
}

export async function simulatePayment(token: string, orderId: string, result?: string) {
    return fetchApi(`/orders/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify(result ? { result } : {}),
        headers: authHeaders(token),
    });
}

export async function getMyOrders(token: string, page = 1, limit = 10) {
    return fetchApi(`/auth/me/orders?page=${page}&limit=${limit}`, {
        headers: authHeaders(token),
    });
}

export async function getMyOrder(token: string, orderId: string) {
    return fetchApi(`/auth/me/orders/${orderId}`, {
        headers: authHeaders(token),
    });
}

// ── Wishlist ─────────────────────────────────────────────────

export async function getWishlist(token: string) {
    return fetchApi('/auth/me/wishlist', {
        headers: authHeaders(token),
    });
}

export async function addToWishlist(token: string, productId: string) {
    return fetchApi(`/auth/me/wishlist/${productId}`, {
        method: 'POST',
        headers: authHeaders(token),
    });
}

export async function removeFromWishlist(token: string, productId: string) {
    return fetchApi(`/auth/me/wishlist/${productId}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });
}

// ── Products ─────────────────────────────────────────────────

export async function getProducts(params?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                searchParams.set(key, String(value));
            }
        });
    }
    const query = searchParams.toString();
    return fetchApi(`/products${query ? `?${query}` : ''}`);
}

export async function getProduct(id: string) {
    return fetchApi(`/products/${id}`);
}

// ── Categories ───────────────────────────────────────────────

export async function getCategories() {
    return fetchApi('/categories');
}

export async function getCategory(id: string) {
    return fetchApi(`/categories/${id}`);
}

// ── Reviews ──────────────────────────────────────────────────

export async function createReview(token: string, productId: string, data: { rating: number; comment: string }) {
    return fetchApi(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: authHeaders(token),
    });
}
