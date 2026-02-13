'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@aanandini/ui';
import { useCart } from '@/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';

export default function CartPage() {
    const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
                <div className="text-center">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6">
                        <ShoppingBag className="h-10 w-10 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h1>
                    <p className="text-slate-500 mb-6 max-w-sm">
                        Looks like you haven&apos;t added anything yet. Start browsing our products!
                    </p>
                    <Link href="/products">
                        <Button className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Browse Products
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in min-h-[70vh]">
            <div className="bg-stone-50 border-b border-stone-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-4xl font-serif text-stone-900 mb-2">Shopping Bag</h1>
                    <p className="text-stone-500 text-sm tracking-widest uppercase">
                        {totalItems} item{totalItems !== 1 && 's'} strictly curated for you
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-8">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-6 sm:gap-8 pb-8 border-b border-stone-100 last:border-0 animate-slide-up"
                            >
                                {/* Image */}
                                <div className="shrink-0 h-32 w-24 sm:h-40 sm:w-32 bg-stone-100 relative">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-3xl font-serif text-stone-300">
                                            {item.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <Link
                                                href={`/products/${item.id}`}
                                                className="font-serif text-xl text-stone-900 hover:text-brand-800 transition-colors block mb-1"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-lg font-medium text-stone-600">
                                                ₹{item.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-stone-400 hover:text-red-700 transition-colors p-1"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <label className="text-xs uppercase tracking-wider text-stone-500">Qty</label>
                                            <div className="flex items-center border border-stone-200">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="h-8 w-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="h-8 w-10 flex items-center justify-center text-sm font-medium text-stone-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="h-8 w-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs uppercase tracking-wider text-stone-500 mb-1">Total</span>
                                            <span className="text-lg font-serif font-medium text-stone-900">
                                                ₹{(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Clear cart */}
                        {items.length > 0 && (
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={clearCart}
                                    className="text-xs uppercase tracking-widest text-stone-400 hover:text-red-700 transition-colors border-b border-transparent hover:border-red-700 pb-0.5"
                                >
                                    Clear Shopping Bag
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-stone-50 p-8 sticky top-24">
                            <h2 className="text-xl font-serif text-stone-900 mb-6 pb-4 border-b border-stone-200">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-600">Subtotal</span>
                                    <span className="text-stone-900 font-medium">
                                        ₹{totalPrice.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-600">Shipping</span>
                                    <span className="text-emerald-700">
                                        {totalPrice >= 999 ? 'Complimentary' : '₹99'}
                                    </span>
                                </div>
                                <div className="border-t border-stone-200 pt-4 flex justify-between items-baseline">
                                    <span className="font-serif text-lg text-stone-900">Total</span>
                                    <span className="font-serif text-2xl text-stone-900">
                                        ₹{(totalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full mb-4 bg-stone-900 hover:bg-brand-900 text-white rounded-none uppercase tracking-widest text-xs font-bold py-4"
                                onClick={() => router.push(user ? '/checkout' : '/login?redirect=/checkout')}
                            >
                                Proceed to Checkout
                            </Button>

                            <Link href="/products" className="block text-center">
                                <span className="text-xs uppercase tracking-widest text-stone-500 hover:text-brand-800 transition-colors border-b border-transparent hover:border-brand-800 pb-0.5">
                                    Continue Shopping
                                </span>
                            </Link>

                            <div className="mt-8 pt-6 border-t border-stone-200 grid grid-cols-3 gap-2 text-center">
                                <div className="space-y-2">
                                    <div className="mx-auto w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                                        <span className="text-xs">🔒</span>
                                    </div>
                                    <p className="text-[0.6rem] uppercase tracking-wide text-stone-500">Secure Payment</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="mx-auto w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                                        <span className="text-xs">✨</span>
                                    </div>
                                    <p className="text-[0.6rem] uppercase tracking-wide text-stone-500">Authentic</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="mx-auto w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                                        <span className="text-xs">🚚</span>
                                    </div>
                                    <p className="text-[0.6rem] uppercase tracking-wide text-stone-500">Fast Delivery</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
