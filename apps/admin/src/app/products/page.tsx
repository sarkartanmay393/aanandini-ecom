'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@aanandini/ui';
import * as api from '@/lib/api';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export default function ProductsPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<api.Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    const fetchProducts = useCallback(() => {
        if (!token) return;
        setLoading(true);
        api.getProducts(token, { page, limit: 10, search })
            .then((res) => {
                setProducts(res.data);
                setMeta({ total: res.meta.total, totalPages: res.meta.totalPages });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [token, page, search]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id: string) => {
        if (!token || !confirm('Are you sure you want to delete this product?')) return;
        setDeleting(id);
        try {
            await api.deleteProduct(token, id);
            fetchProducts();
        } catch { }
        setDeleting(null);
    };

    if (isLoading || !user) return null;

    return (
        <AdminShell>
            <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                        <p className="text-slate-500 mt-1">{meta.total} total products</p>
                    </div>
                    <Link href="/products/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
                        className="h-10 w-full max-w-sm rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left px-6 py-3 font-medium text-slate-500">Product</th>
                                <th className="text-left px-6 py-3 font-medium text-slate-500">Category</th>
                                <th className="text-right px-6 py-3 font-medium text-slate-500">Price</th>
                                <th className="text-right px-6 py-3 font-medium text-slate-500">Stock</th>
                                <th className="text-right px-6 py-3 font-medium text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-10 bg-slate-200 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <div className="font-medium text-slate-900 truncate max-w-[200px]">{product.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{product.category?.name || '—'}</td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900">₹{product.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/products/edit/${product.id}`}>
                                                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deleting === product.id}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-slate-500">
                            Page {page} of {meta.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
