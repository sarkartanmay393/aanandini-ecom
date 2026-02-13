'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import { getAddresses, createAddress, createOrder, simulatePayment } from '@/lib/api';
import { MapPin, Plus, ChevronRight, CreditCard, CheckCircle, XCircle, Clock, ArrowLeft, Loader2, Package } from 'lucide-react';

type Address = {
    id: string; label: string; street: string; city: string; state: string; pincode: string; phone: string; isDefault: boolean;
};

type Step = 'address' | 'review' | 'payment' | 'result';

export default function CheckoutPage() {
    const { user, token } = useAuth();
    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [step, setStep] = useState<Step>('address');
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [showNewAddr, setShowNewAddr] = useState(false);
    const [newAddr, setNewAddr] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [payResult, setPayResult] = useState<{ status: string; paymentId: string | null } | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !token) {
            router.replace('/login?redirect=/checkout');
            return;
        }
        if (items.length === 0) {
            router.replace('/cart');
            return;
        }
        loadAddresses();
    }, [user, token]);

    async function loadAddresses() {
        if (!token) return;
        try {
            const data = await getAddresses(token);
            setAddresses(data);
            const def = data.find((a: Address) => a.isDefault);
            if (def) setSelectedAddress(def.id);
            else if (data.length > 0) setSelectedAddress(data[0].id);
        } catch { }
    }

    async function handleAddAddress(e: React.FormEvent) {
        e.preventDefault();
        if (!token) return;
        setLoading(true);
        try {
            const created = await createAddress(token, { ...newAddr, isDefault: addresses.length === 0 });
            setAddresses([...addresses, created]);
            setSelectedAddress(created.id);
            setShowNewAddr(false);
            setNewAddr({ label: 'Home', street: '', city: '', state: '', pincode: '', phone: '' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handlePlaceOrder() {
        if (!token || !selectedAddress) return;
        setLoading(true);
        setError('');
        try {
            const order = await createOrder(token, {
                items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
                shippingAddressId: selectedAddress,
            });
            setOrderId(order.id);
            setStep('payment');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handlePay(simResult?: string) {
        if (!token || !orderId) return;
        setLoading(true);
        setError('');
        try {
            const result = await simulatePayment(token, orderId, simResult);
            setPayResult({ status: result.paymentStatus, paymentId: result.paymentId });
            if (result.paymentStatus === 'SUCCESS') {
                clearCart();
            }
            setStep('result');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (!user) return null;

    const addr = addresses.find((a) => a.id === selectedAddress);

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    {(['address', 'review', 'payment', 'result'] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${step === s || (['address', 'review', 'payment', 'result'].indexOf(step) > i) ? 'bg-brand-700 text-white' : 'bg-stone-200 text-stone-500'}`}>
                                {i + 1}
                            </div>
                            <span className="hidden sm:block text-xs uppercase tracking-wide text-stone-500">{s === 'result' ? 'Done' : s}</span>
                            {i < 3 && <ChevronRight className="h-4 w-4 text-stone-300" />}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                )}

                {/* ── Step 1: Address ── */}
                {step === 'address' && (
                    <div className="animate-fade-in">
                        <h1 className="text-3xl font-serif text-stone-900 mb-2">Shipping Address</h1>
                        <p className="text-stone-500 mb-8">Choose where you&apos;d like your order delivered</p>

                        <div className="grid gap-4 sm:grid-cols-2 mb-6">
                            {addresses.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setSelectedAddress(a.id)}
                                    className={`text-left p-5 rounded-xl border-2 transition-all ${a.id === selectedAddress ? 'border-brand-700 bg-brand-50/50 ring-1 ring-brand-200' : 'border-stone-200 hover:border-stone-300 bg-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-0.5 rounded">{a.label}</span>
                                        {a.isDefault && <span className="text-[10px] text-stone-400 uppercase">Default</span>}
                                    </div>
                                    <p className="text-sm text-stone-800 font-medium">{a.street}</p>
                                    <p className="text-sm text-stone-500">{a.city}, {a.state} — {a.pincode}</p>
                                    <p className="text-xs text-stone-400 mt-1">📞 {a.phone}</p>
                                </button>
                            ))}

                            <button
                                onClick={() => setShowNewAddr(!showNewAddr)}
                                className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-stone-300 text-stone-500 hover:border-brand-400 hover:text-brand-700 transition-all min-h-[140px]"
                            >
                                <Plus className="h-6 w-6" />
                                <span className="text-sm font-medium">Add New Address</span>
                            </button>
                        </div>

                        {showNewAddr && (
                            <form onSubmit={handleAddAddress} className="bg-white rounded-xl border border-stone-200 p-6 mb-6 animate-fade-in">
                                <h3 className="text-lg font-serif text-stone-800 mb-4">New Address</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-medium text-stone-600 mb-1 block">Label</label>
                                        <select value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none">
                                            <option>Home</option><option>Office</option><option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-stone-600 mb-1 block">Phone</label>
                                        <input value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none" placeholder="10-digit phone" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-medium text-stone-600 mb-1 block">Street Address</label>
                                        <input value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none" placeholder="House number, street name, area" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-stone-600 mb-1 block">City</label>
                                        <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-stone-600 mb-1 block">State</label>
                                        <input value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-stone-600 mb-1 block">Pincode</label>
                                        <input value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} required className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-400 outline-none" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-5">
                                    <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors disabled:opacity-50">
                                        {loading ? 'Saving...' : 'Save Address'}
                                    </button>
                                    <button type="button" onClick={() => setShowNewAddr(false)} className="px-6 py-2.5 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <button
                            onClick={() => setStep('review')}
                            disabled={!selectedAddress}
                            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                        >
                            Continue to Review <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* ── Step 2: Review ── */}
                {step === 'review' && (
                    <div className="animate-fade-in">
                        <button onClick={() => setStep('address')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-6">
                            <ArrowLeft className="h-4 w-4" /> Change Address
                        </button>

                        <h1 className="text-3xl font-serif text-stone-900 mb-8">Review Your Order</h1>

                        {/* Address Summary */}
                        {addr && (
                            <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6 flex items-start gap-4">
                                <MapPin className="h-5 w-5 text-brand-700 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-stone-800">{addr.label}</p>
                                    <p className="text-sm text-stone-600">{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</p>
                                    <p className="text-xs text-stone-400 mt-0.5">📞 {addr.phone}</p>
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">
                            <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
                                <h3 className="text-sm font-medium text-stone-700">Items ({items.length})</h3>
                            </div>
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-5 border-b border-stone-50 last:border-0">
                                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover bg-stone-100" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                                        <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium text-stone-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                            <div className="flex justify-between px-5 py-4 bg-stone-50 border-t border-stone-100">
                                <span className="text-sm font-medium text-stone-700">Total</span>
                                <span className="text-lg font-serif font-bold text-stone-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors disabled:opacity-50 flex items-center gap-2 justify-center"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                            {loading ? 'Placing Order...' : 'Place Order & Pay'}
                        </button>
                    </div>
                )}

                {/* ── Step 3: Payment ── */}
                {step === 'payment' && (
                    <div className="animate-fade-in text-center max-w-md mx-auto">
                        <CreditCard className="h-12 w-12 text-brand-700 mx-auto mb-4" />
                        <h1 className="text-3xl font-serif text-stone-900 mb-2">Payment</h1>
                        <p className="text-stone-500 mb-8">This is a demo payment gateway. Choose a payment outcome to simulate:</p>

                        <div className="grid gap-3">
                            <button
                                onClick={() => handlePay('SUCCESS')}
                                disabled={loading}
                                className="w-full px-6 py-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Simulate Successful Payment
                            </button>
                            <button
                                onClick={() => handlePay('FAILED')}
                                disabled={loading}
                                className="w-full px-6 py-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                                Simulate Failed Payment
                            </button>
                            <button
                                onClick={() => handlePay('PENDING')}
                                disabled={loading}
                                className="w-full px-6 py-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />}
                                Simulate Pending Payment
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Result ── */}
                {step === 'result' && payResult && (
                    <div className="animate-fade-in text-center max-w-md mx-auto">
                        {payResult.status === 'SUCCESS' && (
                            <>
                                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                                </div>
                                <h1 className="text-3xl font-serif text-stone-900 mb-2">Order Confirmed!</h1>
                                <p className="text-stone-500 mb-1">Your payment was successful.</p>
                                <p className="text-xs text-stone-400 mb-8">Payment ID: {payResult.paymentId}</p>
                            </>
                        )}
                        {payResult.status === 'FAILED' && (
                            <>
                                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                                <h1 className="text-3xl font-serif text-stone-900 mb-2">Payment Failed</h1>
                                <p className="text-stone-500 mb-8">Your payment could not be processed. Please try again.</p>
                            </>
                        )}
                        {payResult.status === 'PENDING' && (
                            <>
                                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                                    <Clock className="h-10 w-10 text-amber-600" />
                                </div>
                                <h1 className="text-3xl font-serif text-stone-900 mb-2">Payment Pending</h1>
                                <p className="text-stone-500 mb-8">Your payment is being processed. We&apos;ll update you once confirmed.</p>
                            </>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/account/orders" className="px-6 py-3 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
                                <Package className="h-4 w-4" /> View My Orders
                            </Link>
                            <Link href="/products" className="px-6 py-3 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                                Continue Shopping
                            </Link>
                            {payResult.status === 'FAILED' && (
                                <button onClick={() => setStep('payment')} className="px-6 py-3 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors">
                                    Retry Payment
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
