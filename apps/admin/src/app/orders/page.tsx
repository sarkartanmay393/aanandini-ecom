'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import { Button } from '@aanandini/ui';
import * as api from '@/lib/api';
import { Search } from 'lucide-react';

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function OrdersPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<api.Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    const fetchOrders = useCallback(() => {
        if (!token) return;
        setLoading(true);
        const query: Record<string, string | number> = { page, limit: 10 };
        if (statusFilter) query.status = statusFilter;
        api.getOrders(token, query)
            .then((res) => {
                setOrders(res.data);
                setMeta({ total: res.meta.total, totalPages: res.meta.totalPages });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [token, page, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (!token) return;
        setUpdating(orderId);
        try {
            await api.updateOrderStatus(token, orderId, newStatus);
            fetchOrders();
        } catch { }
        setUpdating(null);
    };

    if (isLoading || !user) return null;

    return (
        <AdminShell>
            <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                        <p className="text-slate-500 mt-1">{meta.total} total orders</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <select
                        value={statusFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="h-10 appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-10 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left px-6 py-3 font-medium text-slate-500">Order ID</th>
                                <th className="text-left px-6 py-3 font-medium text-slate-500">Customer</th>
                                <th className="text-left px-6 py-3 font-medium text-slate-500">Items</th>
                                <th className="text-right px-6 py-3 font-medium text-slate-500">Total</th>
                                <th className="text-left px-6 py-3 font-medium text-slate-500">Status</th>
                                <th className="text-left px-6 py-3 font-medium text-slate-500">Date</th>
                                <th className="text-right px-6 py-3 font-medium text-slate-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                            {order.id.slice(0, 8)}…
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{order.user.name}</div>
                                            <div className="text-xs text-slate-400">{order.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                                            ₹{order.total.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status] || ''}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-xs">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(order.id, e.target.value)}
                                                disabled={updating === order.id}
                                                className="h-8 appearance-none rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="DELIVERED">Delivered</option>
                                            </select>
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
                        <p className="text-sm text-slate-500">Page {page} of {meta.totalPages}</p>
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
