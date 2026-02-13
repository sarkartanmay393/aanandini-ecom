'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '@/lib/api';
import { MapPin, Plus, Pencil, Trash2, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Address = {
    id: string; label: string; street: string; city: string; state: string; pincode: string; phone: string; isDefault: boolean;
};

const emptyAddr = { label: 'Home', street: '', city: '', state: '', pincode: '', phone: '' };

export default function AddressesPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyAddr);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !token) { router.replace('/login?redirect=/account/addresses'); return; }
        load();
    }, [user, token]);

    async function load() {
        if (!token) return;
        setLoading(true);
        try {
            setAddresses(await getAddresses(token));
        } catch { } finally { setLoading(false); }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!token) return;
        setSaving(true);
        try {
            if (editId) {
                await updateAddress(token, editId, form);
            } else {
                await createAddress(token, { ...form, isDefault: addresses.length === 0 });
            }
            await load();
            setShowForm(false);
            setEditId(null);
            setForm(emptyAddr);
        } catch { } finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!token) return;
        setDeletingId(id);
        try {
            await deleteAddress(token, id);
            await load();
        } catch { } finally { setDeletingId(null); }
    }

    async function handleSetDefault(id: string) {
        if (!token) return;
        try {
            await updateAddress(token, id, { isDefault: true });
            await load();
        } catch { }
    }

    function startEdit(a: Address) {
        setEditId(a.id);
        setForm({ label: a.label, street: a.street, city: a.city, state: a.state, pincode: a.pincode, phone: a.phone });
        setShowForm(true);
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
            <Link href="/account" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-4">
                <ArrowLeft className="h-4 w-4" /> Account
            </Link>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 mb-1">My Addresses</h1>
                    <p className="text-stone-500 text-sm">Manage your shipping addresses</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyAddr); }} className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="bg-white rounded-xl border border-stone-200 p-6 mb-8 animate-fade-in">
                    <h3 className="text-lg font-serif text-stone-800 mb-4">{editId ? 'Edit' : 'New'} Address</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-medium text-stone-600 mb-1 block">Label</label>
                            <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 outline-none">
                                <option>Home</option><option>Office</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-stone-600 mb-1 block">Phone</label>
                            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-stone-600 mb-1 block">Street Address</label>
                            <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-stone-600 mb-1 block">City</label>
                            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-stone-600 mb-1 block">State</label>
                            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-stone-600 mb-1 block">Pincode</label>
                            <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 outline-none" />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-50 flex items-center gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-5 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2">
                            <X className="h-4 w-4" /> Cancel
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="text-center py-12 text-stone-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p className="font-serif text-lg text-stone-500">No addresses yet</p>
                    <p className="text-sm">Add your first shipping address</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((a) => (
                        <div key={a.id} className={`bg-white rounded-xl border-2 p-5 ${a.isDefault ? 'border-brand-300' : 'border-stone-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{a.label}</span>
                                {a.isDefault && <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Default</span>}
                            </div>
                            <p className="text-sm text-stone-800 font-medium">{a.street}</p>
                            <p className="text-sm text-stone-500">{a.city}, {a.state} — {a.pincode}</p>
                            <p className="text-xs text-stone-400 mt-1">📞 {a.phone}</p>
                            <div className="flex gap-3 mt-4 pt-3 border-t border-stone-100">
                                <button onClick={() => startEdit(a)} className="text-xs text-stone-500 hover:text-brand-700 flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                                {!a.isDefault && <button onClick={() => handleSetDefault(a.id)} className="text-xs text-stone-500 hover:text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> Set Default</button>}
                                <button onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 ml-auto"><Trash2 className="h-3 w-3" /> {deletingId === a.id ? '...' : 'Delete'}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
