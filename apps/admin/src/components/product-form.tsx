'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import { Button, Input } from '@aanandini/ui';
import * as api from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
    productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
    const { user, token, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const isEditing = !!productId;

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        images: '',
        categoryId: '',
    });
    const [categories, setCategories] = useState<api.Category[]>([]);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'ADMIN')) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (token) {
            api.getCategories(token).then(setCategories).catch(() => { });
        }
    }, [token]);

    useEffect(() => {
        if (token && productId) {
            api.getProduct(token, productId)
                .then((p) => {
                    setForm({
                        name: p.name,
                        description: p.description,
                        price: String(p.price),
                        stock: String(p.stock),
                        images: p.images.join(', '),
                        categoryId: p.categoryId,
                    });
                })
                .catch(() => setError('Failed to load product'))
                .finally(() => setLoading(false));
        }
    }, [token, productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setError('');
        setSaving(true);

        const data = {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            stock: parseInt(form.stock, 10),
            images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
            categoryId: form.categoryId,
        };

        try {
            if (isEditing && productId) {
                await api.updateProduct(token, productId, data);
            } else {
                await api.createProduct(token, data);
            }
            router.push('/products');
        } catch (err: any) {
            setError(err.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user) return null;

    return (
        <AdminShell>
            <div className="max-w-2xl animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/products">
                        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isEditing ? 'Edit Product' : 'New Product'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isEditing ? 'Update product details' : 'Add a new product to the catalog'}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 animate-scale-in">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                                <Input
                                    value={form.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Product name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Product description..."
                                    rows={4}
                                    required
                                    className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹)</label>
                                    <Input
                                        type="number"
                                        value={form.price}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: e.target.value })}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock</label>
                                    <Input
                                        type="number"
                                        value={form.stock}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, stock: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                                <select
                                    value={form.categoryId}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, categoryId: e.target.value })}
                                    required
                                    className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URLs</label>
                                <Input
                                    value={form.images}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, images: e.target.value })}
                                    placeholder="https://img1.jpg, https://img2.jpg"
                                />
                                <p className="text-xs text-slate-400 mt-1">Comma-separated list of image URLs</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Link href="/products">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" className="gap-2" disabled={saving}>
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AdminShell>
    );
}
