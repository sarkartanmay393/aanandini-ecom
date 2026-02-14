'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import * as api from '@/lib/api';
import { Package, ShoppingCart, Users, DollarSign, Clock, TrendingUp, ArrowRight } from 'lucide-react';

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
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="bg-brand-600" />
                            <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="bg-emerald-600" />
                            <StatCard icon={DollarSign} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="bg-amber-600" />
                            <StatCard icon={Users} label="Customers" value={stats.totalUsers} color="bg-purple-600" />
                            <StatCard icon={Clock} label="Pending Orders" value={stats.pendingOrders} color="bg-orange-600" sub="Needs attention" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                            {/* Order Status Breakdown */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Status Breakdown</h2>
                                <div className="space-y-3">
                                    {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => {
                                        const pct = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                                        const barColors: Record<string, string> = { PENDING: 'bg-yellow-500', PROCESSING: 'bg-blue-500', SHIPPED: 'bg-purple-500', DELIVERED: 'bg-green-500', CANCELLED: 'bg-red-500' };
                                        const badgeColors: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-700', PROCESSING: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };
                                        return (
                                            <div key={status}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColors[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
                                                    <span className="text-sm text-slate-600 font-medium">{count} ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full transition-all ${barColors[status] || 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Object.keys(stats.statusBreakdown || {}).length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-4">No orders yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Selling Products */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">Top Selling Products</h2>
                                    <TrendingUp className="h-5 w-5 text-slate-400" />
                                </div>
                                <div className="space-y-3">
                                    {(stats.topProducts || []).map((product, idx) => (
                                        <div key={product.productId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                            <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                                            {product.image ? (
                                                <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><Package className="h-4 w-4 text-slate-400" /></div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                                                <p className="text-xs text-slate-400">{product.totalQuantity} units sold</p>
                                            </div>
                                            <span className="text-sm font-semibold text-emerald-600">₹{product.totalRevenue.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {(stats.topProducts || []).length === 0 && (
                                        <p className="text-sm text-slate-400 text-center py-4">No sales data yet</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
                                <Link href="/orders" className="text-sm text-brand-700 hover:text-brand-800 font-medium flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
                            </div>
                            {(stats.recentOrders || []).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentOrders.map((order) => {
                                                const statusColors: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-700', PROCESSING: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };
                                                return (
                                                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 px-6 text-sm font-mono text-slate-600">{order.id.slice(0, 8)}...</td>
                                                        <td className="py-3 px-6 text-sm text-slate-800">{order.customerName}</td>
                                                        <td className="py-3 px-6 text-sm text-slate-600">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</td>
                                                        <td className="py-3 px-6 text-sm font-semibold text-slate-800">₹{order.total.toLocaleString()}</td>
                                                        <td className="py-3 px-6"><span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>{order.status}</span></td>
                                                        <td className="py-3 px-6 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-slate-400">No orders yet</div>
                            )}
                        </div>
                    </>
                ) : (
                    <p className="text-slate-500">Unable to load dashboard data.</p>
                )}
            </div>
        </AdminShell>
    );
}
