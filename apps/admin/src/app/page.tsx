'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import * as api from '@/lib/api';
import { Package, ShoppingCart, Users, DollarSign, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                {sub && <span className="text-xs text-slate-400">{sub}</span>}
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
        </div>
    );
}

export default function DashboardPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<api.DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (token) {
            api.getStats(token)
                .then(setStats)
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (isLoading || !user) return null;

    return (
        <AdminShell>
            <div className="animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user.name}!</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                                <div className="h-10 w-10 bg-slate-200 rounded-lg mb-4" />
                                <div className="h-6 w-16 bg-slate-200 rounded mb-2" />
                                <div className="h-4 w-24 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        <StatCard
                            icon={Package}
                            label="Total Products"
                            value={stats.totalProducts}
                            color="bg-brand-600"
                        />
                        <StatCard
                            icon={ShoppingCart}
                            label="Total Orders"
                            value={stats.totalOrders}
                            color="bg-emerald-600"
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Total Revenue"
                            value={`₹${stats.totalRevenue.toLocaleString()}`}
                            color="bg-amber-600"
                        />
                        <StatCard
                            icon={Users}
                            label="Customers"
                            value={stats.totalUsers}
                            color="bg-purple-600"
                        />
                        <StatCard
                            icon={Clock}
                            label="Pending Orders"
                            value={stats.pendingOrders}
                            color="bg-orange-600"
                            sub="Needs attention"
                        />
                    </div>
                ) : (
                    <p className="text-slate-500">Unable to load dashboard data.</p>
                )}
            </div>
        </AdminShell>
    );
}
