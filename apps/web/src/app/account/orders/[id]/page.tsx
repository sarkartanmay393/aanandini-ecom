'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { getMyOrder } from '@/lib/api';
import { ArrowLeft, MapPin, Package, Loader2, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';

const statusSteps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const statusIcons: Record<string, any> = {
    PENDING: Clock,
    PROCESSING: Package,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: XCircle,
};

export default function OrderDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const { user, token } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !token) { router.replace('/login'); return; }
        load();
    }, [user, token]);

    async function load() {
        if (!token) return;
        setLoading(true);
        try {
            setOrder(await getMyOrder(token, id));
        } catch { } finally { setLoading(false); }
    }

    if (!user) return null;

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-stone-400" />
        </div>
    );

    if (!order) return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <p className="text-stone-500">Order not found</p>
        </div>
    );

    const currentStep = order.status === 'CANCELLED' ? -1 : statusSteps.indexOf(order.status);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
            <Link href="/account/orders" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-4">
                <ArrowLeft className="h-4 w-4" /> All Orders
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-sm text-stone-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs uppercase tracking-wide font-medium px-3 py-1.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                    </span>
                    <span className={`text-xs uppercase tracking-wide font-medium px-3 py-1.5 rounded-full ${order.paymentStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        Payment: {order.paymentStatus}
                    </span>
                </div>
            </div>

            {/* Status Timeline */}
            {order.status !== 'CANCELLED' && (
                <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        {statusSteps.map((step, i) => {
                            const Icon = statusIcons[step];
                            const isActive = i <= currentStep;
                            return (
                                <div key={step} className="flex items-center flex-1 last:flex-0">
                                    <div className="flex flex-col items-center">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isActive ? 'bg-brand-700 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] mt-1.5 text-stone-500 uppercase tracking-wide hidden sm:block">{step}</span>
                                    </div>
                                    {i < statusSteps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-brand-700' : 'bg-stone-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Shipping Address */}
            {order.shippingAddress && (
                <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6 flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-brand-700 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-stone-800">{order.shippingAddress.label}</p>
                        <p className="text-sm text-stone-600">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                        <p className="text-xs text-stone-400 mt-0.5">📞 {order.shippingAddress.phone}</p>
                    </div>
                </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">
                <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
                    <h3 className="text-sm font-medium text-stone-700">Items ({order.items.length})</h3>
                </div>
                {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-5 border-b border-stone-50 last:border-0">
                        <img src={item.product.images?.[0] || ''} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover bg-stone-100" />
                        <div className="flex-1 min-w-0">
                            <Link href={`/products/${item.product.id}`} className="text-sm font-medium text-stone-800 hover:text-brand-700 truncate block">{item.product.name}</Link>
                            <p className="text-xs text-stone-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-sm font-medium text-stone-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                ))}
                <div className="flex justify-between px-5 py-4 bg-stone-50 border-t border-stone-100">
                    <span className="text-sm font-medium text-stone-700">Total</span>
                    <span className="text-lg font-serif font-bold text-stone-900">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
            </div>

            {order.paymentId && (
                <p className="text-xs text-stone-400 text-right">Payment ID: {order.paymentId}</p>
            )}
        </div>
    );
}
