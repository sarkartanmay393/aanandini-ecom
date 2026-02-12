'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';

export function Header() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 glass border-b border-slate-200/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110">
                            A
                        </div>
                        <span className="text-xl font-bold text-gradient">Aanandini</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
                        >
                            Products
                        </Link>
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-medium animate-scale-in">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Auth */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-sm text-slate-600">
                                    Hi, <span className="font-medium text-slate-900">{user.name}</span>
                                </span>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors px-3 py-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200/60 animate-fade-in">
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/products"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Products
                            </Link>
                            {user ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-slate-500">
                                        Signed in as <span className="font-medium text-slate-900">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileOpen(false);
                                        }}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileOpen(false)}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
