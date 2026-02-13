'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import { Button, Input } from '@aanandini/ui';
import * as api from '@/lib/api';
import { Tag, Plus, Pencil, Trash2, Save, X, Package } from 'lucide-react';

export default function CategoriesPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState<api.Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchCategories = useCallback(async () => {
        if (!token) return;
        try {
            const data = await api.getCategories(token);
            setCategories(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isLoading) return;
        if (!user || user.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        fetchCategories();
    }, [user, isLoading, router, fetchCategories]);

    const handleCreate = async () => {
        if (!token || !newName.trim()) return;
        setSaving(true);
        setError('');
        try {
            await api.createCategory(token, { name: newName.trim() });
            setNewName('');
            setShowCreate(false);
            await fetchCategories();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!token || !editName.trim()) return;
        setSaving(true);
        setError('');
        try {
            await api.updateCategory(token, id, { name: editName.trim() });
            setEditingId(null);
            await fetchCategories();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!token) return;
        if (!confirm(`Delete category "${name}"? Products in this category will need to be reassigned.`)) return;
        try {
            await api.deleteCategory(token, id);
            await fetchCategories();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage product categories</p>
                    </div>
                    <Button
                        onClick={() => { setShowCreate(true); setNewName(''); }}
                        className="bg-slate-900 hover:bg-slate-800 text-white gap-2 w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                {/* Create form */}
                {showCreate && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">New Category</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                                placeholder="Category name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                className="flex-1"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCreate}
                                    disabled={saving || !newName.trim()}
                                    className="bg-brand-700 hover:bg-brand-800 text-white gap-2 flex-1 sm:flex-none"
                                >
                                    <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 sm:flex-none"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Slug will be auto-generated from the name</p>
                    </div>
                )}

                {/* Categories list */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                                <div className="h-5 bg-slate-200 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                        <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-1">No categories yet</h3>
                        <p className="text-sm text-slate-500">Create your first product category</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Desktop table */}
                        <div className="hidden sm:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                                        <th className="text-center py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</th>
                                        <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                {editingId === cat.id ? (
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdate(cat.id);
                                                            if (e.key === 'Escape') setEditingId(null);
                                                        }}
                                                        className="max-w-xs"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
                                                            <Tag className="h-4 w-4 text-brand-700" />
                                                        </div>
                                                        <span className="font-medium text-slate-900">{cat.name}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{cat.slug}</code>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                                                    <Package className="h-3.5 w-3.5" />
                                                    {cat._count?.products ?? 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    {editingId === cat.id ? (
                                                        <>
                                                            <Button size="sm" onClick={() => handleUpdate(cat.id)} disabled={saving} className="bg-brand-700 hover:bg-brand-800 text-white gap-1 text-xs"><Save className="h-3 w-3" /> Save</Button>
                                                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="text-xs"><X className="h-3 w-3" /></Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-slate-400 hover:text-brand-700 p-2 rounded-lg hover:bg-brand-50 transition-colors"><Pencil className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDelete(cat.id, cat.name)} className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-slate-100">
                            {categories.map((cat) => (
                                <div key={cat.id} className="p-4">
                                    {editingId === cat.id ? (
                                        <div className="space-y-3">
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleUpdate(cat.id)} disabled={saving} className="bg-brand-700 text-white flex-1 gap-1"><Save className="h-3 w-3" /> Save</Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
                                                        <Tag className="h-4 w-4 text-brand-700" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{cat.name}</div>
                                                        <div className="text-xs text-slate-400">{cat._count?.products ?? 0} products</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-slate-400 hover:text-brand-700 p-2"><Pencil className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(cat.id, cat.name)} className="text-slate-400 hover:text-red-600 p-2"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
