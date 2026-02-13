'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { getProfile, updateProfile } from '@/lib/api';
import { User, Package, MapPin, Heart, Save, Loader2 } from 'lucide-react';

export default function AccountPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!user || !token) { router.replace('/login?redirect=/account'); return; }
        loadProfile();
    }, [user, token]);

    async function loadProfile() {
        if (!token) return;
        try {
            const data = await getProfile(token);
            setProfile(data);
            setName(data.name);
            setPhone(data.phone || '');
        } catch { }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!token) return;
        setSaving(true);
        setMsg('');
        try {
            await updateProfile(token, { name, phone });
            setMsg('Profile updated successfully!');
        } catch (err: any) {
            setMsg(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (!user) return null;

    const links = [
        { href: '/account/orders', icon: Package, label: 'My Orders', desc: 'View your order history and track shipments' },
        { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage your shipping addresses' },
        { href: '/account/wishlist', icon: Heart, label: 'Wishlist', desc: 'Products you\'ve saved for later' },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
            <h1 className="text-3xl font-serif text-stone-900 mb-2">My Account</h1>
            <p className="text-stone-500 mb-8">Manage your profile and preferences</p>

            {/* Profile Form */}
            <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-brand-700" />
                    </div>
                    <div>
                        <h2 className="text-lg font-serif font-medium text-stone-800">Personal Details</h2>
                        <p className="text-xs text-stone-400">Update your name and phone number</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-xs font-medium text-stone-600 mb-1 block">Full Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-stone-600 mb-1 block">Email</label>
                        <input value={profile?.email || ''} disabled className="w-full rounded-lg border border-stone-100 px-4 py-2.5 text-sm bg-stone-50 text-stone-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-stone-600 mb-1 block">Phone</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-stone-600 mb-1 block">Member Since</label>
                        <input value={profile ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : ''} disabled className="w-full rounded-lg border border-stone-100 px-4 py-2.5 text-sm bg-stone-50 text-stone-400 cursor-not-allowed" />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-4">
                        <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        {msg && <span className={`text-sm ${msg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>{msg}</span>}
                    </div>
                </form>
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 sm:grid-cols-3">
                {links.map(({ href, icon: Icon, label, desc }) => (
                    <Link key={href} href={href} className="group bg-white rounded-xl border border-stone-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all">
                        <Icon className="h-6 w-6 text-brand-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-sm font-medium text-stone-800 mb-1">{label}</h3>
                        <p className="text-xs text-stone-500">{desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
