'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@anandibi/ui';
import { useCart } from '@/providers/cart-provider';

export default function CartPage() {
    const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();

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
        <div className="animate-fade-in">
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
                    <p className="mt-2 text-slate-500">
                        {totalItems} item{totalItems !== 1 && 's'} in your cart
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 flex gap-4 sm:gap-6 animate-scale-in"
                            >
                                {/* Image */}
                                <div className="shrink-0 h-24 w-24 sm:h-28 sm:w-28 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-slate-300">
                                            {item.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/products/${item.id}`}
                                        className="font-semibold text-slate-900 hover:text-brand-600 transition-colors line-clamp-1"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-lg font-bold text-slate-900 mt-1">
                                        ₹{item.price.toLocaleString()}
                                    </p>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity */}
                                        <div className="flex items-center gap-0">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="h-8 w-8 rounded-l-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="h-8 w-10 border-t border-b border-slate-300 flex items-center justify-center text-sm font-medium text-slate-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="h-8 w-8 rounded-r-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Subtotal on desktop */}
                                <div className="hidden sm:flex flex-col items-end justify-center">
                                    <span className="text-sm text-slate-500">Subtotal</span>
                                    <span className="text-lg font-bold text-slate-900">
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Clear cart */}
                        <div className="flex justify-end">
                            <button
                                onClick={clearCart}
                                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal ({totalItems} items)</span>
                                    <span className="text-slate-900 font-medium">
                                        ₹{totalPrice.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Shipping</span>
                                    <span className="text-emerald-600 font-medium">
                                        {totalPrice >= 999 ? 'Free' : '₹99'}
                                    </span>
                                </div>
                                <div className="border-t border-slate-200 pt-3 flex justify-between">
                                    <span className="font-semibold text-slate-900">Total</span>
                                    <span className="font-bold text-xl text-slate-900">
                                        ₹{(totalPrice + (totalPrice >= 999 ? 0 : 99)).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <Button size="lg" className="w-full mb-3">
                                Proceed to Checkout
                            </Button>
                            <Link href="/products" className="block">
                                <Button variant="ghost" className="w-full gap-1 text-sm">
                                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                                </Button>
                            </Link>

                            {totalPrice < 999 && (
                                <p className="text-xs text-slate-500 mt-4 text-center">
                                    Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
