'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { AdminShell } from '@/components/admin-shell';
import * as api from '@/lib/api';
import {
    ShoppingCart, ChevronDown, ChevronUp, MapPin, CreditCard,
    User, Phone, Mail, Package, Clock, Filter
} from 'lucide-react';
import { Button } from '@aanandini/ui';

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const paymentColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    SUCCESS: 'bg-emerald-50 text-emerald-700',
    FAILED: 'bg-red-50 text-red-700',
};

const allStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<api.Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const query: Record<string, string | number> = { page, limit: 15 };
            if (statusFilter) query.status = statusFilter;
            const res = await api.getOrders(token, query);
            setOrders(res.data);
            setMeta(res.meta);
        } catch { } finally {
            setLoading(false);
        }
    }, [token, page, statusFilter]);

    useEffect(() => {
        if (isLoading) return;
        if (!user || user.role !== 'ADMIN') { router.push('/login'); return; }
        fetchOrders();
    }, [user, isLoading, router, fetchOrders]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (!token) return;
        try {
            await api.updateOrderStatus(token, orderId, newStatus);
            await fetchOrders();
        } catch { }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <AdminShell>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {meta ? `${meta.total} total orders` : 'Loading...'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        >
                            <option value="">All Status</option>
                            {allStatuses.map(s => (
                                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                                <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                                <div className="h-4 bg-slate-200 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                        <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700">No orders found</h3>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Order header row */}
                                <div
                                    className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                                        {/* Order ID & Date */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-sm font-semibold text-slate-900">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColors[order.status] || ''}`}>
                                                    {order.status}
                                                </span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${paymentColors[order.paymentStatus] || ''}`}>
                                                    ₹ {order.paymentStatus}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {order.user?.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total & Items count */}
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900">₹{order.total.toLocaleString()}</div>
                                                <div className="text-xs text-slate-400">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 && 's'}</div>
                                            </div>
                                            {expandedId === order.id ? (
                                                <ChevronUp className="h-5 w-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {expandedId === order.id && (
                                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 space-y-6 animate-in">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Customer Info */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5" /> Customer
                                                </h4>
                                                <div className="bg-white rounded-lg p-4 border border-slate-200 text-sm space-y-2">
                                                    <div className="font-medium text-slate-900">{order.user?.name}</div>
                                                    {order.user?.email && (
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Mail className="h-3.5 w-3.5" /> {order.user.email}
                                                        </div>
                                                    )}
                                                    {order.user?.phone && (
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <Phone className="h-3.5 w-3.5" /> {order.user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" /> Shipping Address
                                                </h4>
                                                {order.shippingAddress ? (
                                                    <div className="bg-white rounded-lg p-4 border border-slate-200 text-sm space-y-1">
                                                        <div className="font-medium text-slate-900">{order.shippingAddress.label}</div>
                                                        <div className="text-slate-600">{order.shippingAddress.street}</div>
                                                        <div className="text-slate-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</div>
                                                        <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                                                            <Phone className="h-3 w-3" /> {order.shippingAddress.phone}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white rounded-lg p-4 border border-slate-200 text-sm text-slate-400 italic">
                                                        No address on record
                                                    </div>
                                                )}
                                            </div>

                                            {/* Payment Info */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                    <CreditCard className="h-3.5 w-3.5" /> Payment
                                                </h4>
                                                <div className="bg-white rounded-lg p-4 border border-slate-200 text-sm space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Status</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${paymentColors[order.paymentStatus] || ''}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                    {order.paymentId && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-500">Payment ID</span>
                                                            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{order.paymentId}</code>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500">Total</span>
                                                        <span className="font-bold text-slate-900">₹{order.total.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                <Package className="h-3.5 w-3.5" /> Items ({order.items?.length || 0})
                                            </h4>
                                            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
                                                {order.items?.map(item => (
                                                    <div key={item.id} className="flex items-center gap-4 p-4">
                                                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                                            {item.product.images?.[0] ? (
                                                                <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-slate-400 text-lg font-serif">
                                                                    {item.product.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm text-slate-900 truncate">{item.product.name}</div>
                                                            <div className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</div>
                                                        </div>
                                                        <div className="text-sm font-semibold text-slate-900 shrink-0">
                                                            ₹{(item.quantity * item.price).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status Update */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t border-slate-200">
                                            <label className="text-sm font-medium text-slate-700">Update Status:</label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                            >
                                                {allStatuses.map(s => (
                                                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-slate-600 px-4">
                            Page {page} of {meta.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
