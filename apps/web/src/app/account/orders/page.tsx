'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { getMyOrders } from '@/lib/api';
import { Package, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const paymentColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-600',
    SUCCESS: 'bg-emerald-50 text-emerald-600',
    FAILED: 'bg-red-50 text-red-600',
};

export default function OrdersPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!user || !token) { router.replace('/login?redirect=/account/orders'); return; }
        load();
    }, [user, token, page]);

    async function load() {
        if (!token) return;
        setLoading(true);
        try {
            const data = await getMyOrders(token, page, 10);
            setOrders(data.data);
            setTotalPages(data.meta.totalPages);
        } catch { } finally { setLoading(false); }
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
            <Link href="/account" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-4">
                <ArrowLeft className="h-4 w-4" /> Account
            </Link>
            <h1 className="text-3xl font-serif text-stone-900 mb-2">My Orders</h1>
            <p className="text-stone-500 mb-8 text-sm">Track your orders and view purchase history</p>

            {loading ? (
                <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-stone-400" /></div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                    <Package className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p className="font-serif text-lg text-stone-500">No orders yet</p>
                    <p className="text-sm mb-4">Start shopping to see your orders here</p>
                    <Link href="/products" className="px-6 py-2.5 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors inline-block">
                        Browse Collection
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/account/orders/${order.id}`}
                            className="block bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-xs text-stone-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-xs text-stone-400 mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase tracking-wide font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || ''}`}>
                                        {order.status}
                                    </span>
                                    <span className={`text-[10px] uppercase tracking-wide font-medium px-2.5 py-1 rounded-full ${paymentColors[order.paymentStatus] || ''}`}>
                                        Pay: {order.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex -space-x-2">
                                    {order.items.slice(0, 3).map((item: any, i: number) => (
                                        <img key={i} src={item.product.images?.[0] || ''} alt="" className="h-10 w-10 rounded-lg object-cover border-2 border-white bg-stone-100" />
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="h-10 w-10 rounded-lg bg-stone-100 border-2 border-white flex items-center justify-center text-xs text-stone-500">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-stone-600 truncate">
                                        {order.items.map((i: any) => i.product.name).join(', ')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-lg font-serif font-bold text-stone-900">₹{order.total.toLocaleString('en-IN')}</p>
                                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-brand-700 transition-colors" />
                            </div>
                        </Link>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-brand-700 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
