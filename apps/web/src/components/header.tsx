'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, User, LogOut, Heart, Package, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';

export function Header() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <header className="sticky top-0 z-50 glass border-b border-stone-200/50 transition-all duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Left Nav (Desktop) */}
                    <nav className="hidden md:flex items-center gap-8 flex-1">
                        <Link
                            href="/"
                            className="text-sm font-medium text-stone-600 hover:text-brand-800 transition-colors uppercase tracking-wide"
                        >
                            Home
                        </Link>
                        <Link
                            href="/products"
                            className="text-sm font-medium text-stone-600 hover:text-brand-800 transition-colors uppercase tracking-wide"
                        >
                            Collection
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    {/* Logo (Centered) */}
                    <Link href="/" className="flex flex-col items-center justify-center gap-1 group">
                        <span className="text-2xl font-serif font-bold text-stone-900 tracking-tight group-hover:text-brand-800 transition-colors">
                            Aanandini
                        </span>
                        <span className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-500 font-medium">
                            Handloom Sarees
                        </span>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center justify-end gap-5 flex-1">
                        {/* Auth */}
                        {user ? (
                            <div className="hidden md:block relative" ref={menuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 text-sm text-stone-600 hover:text-brand-800 transition-colors font-serif italic"
                                >
                                    <User className="h-4 w-4" />
                                    {user.name.split(' ')[0]}
                                    <ChevronDown className={`h-3 w-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white shadow-xl border border-stone-100 py-2 animate-fade-in z-50">
                                        <Link
                                            href="/account"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                        >
                                            <User className="h-4 w-4 text-stone-400" />
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/account/orders"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                        >
                                            <Package className="h-4 w-4 text-stone-400" />
                                            My Orders
                                        </Link>
                                        <Link
                                            href="/account/addresses"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                        >
                                            <MapPin className="h-4 w-4 text-stone-400" />
                                            Addresses
                                        </Link>
                                        <Link
                                            href="/account/wishlist"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                        >
                                            <Heart className="h-4 w-4 text-stone-400" />
                                            Wishlist
                                        </Link>
                                        <div className="h-px bg-stone-100 my-1" />
                                        <button
                                            onClick={() => {
                                                logout();
                                                setUserMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="hidden md:block text-stone-500 hover:text-brand-800 transition-colors">
                                <User className="h-5 w-5" />
                            </Link>
                        )}

                        {/* Wishlist */}
                        {user && (
                            <Link href="/account/wishlist" className="hidden md:block text-stone-500 hover:text-brand-800 transition-colors">
                                <Heart className="h-5 w-5" />
                            </Link>
                        )}

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative text-stone-600 hover:text-brand-800 transition-colors group"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-700 text-white text-[10px] flex items-center justify-center font-medium animate-scale-in">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden py-6 border-t border-stone-100 animate-fade-in bg-white/95 backdrop-blur-md absolute left-0 right-0 px-6 shadow-lg">
                        <nav className="flex flex-col gap-4">
                            <Link href="/" onClick={() => setMobileOpen(false)} className="text-lg font-serif text-stone-800 hover:text-brand-800">
                                Home
                            </Link>
                            <Link href="/products" onClick={() => setMobileOpen(false)} className="text-lg font-serif text-stone-800 hover:text-brand-800">
                                Our Collection
                            </Link>
                            <div className="h-px bg-stone-100 my-2" />
                            {user ? (
                                <>
                                    <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm font-medium text-stone-600 hover:text-brand-800">
                                        <User className="h-4 w-4" /> My Profile
                                    </Link>
                                    <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm font-medium text-stone-600 hover:text-brand-800">
                                        <Package className="h-4 w-4" /> My Orders
                                    </Link>
                                    <Link href="/account/addresses" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm font-medium text-stone-600 hover:text-brand-800">
                                        <MapPin className="h-4 w-4" /> Addresses
                                    </Link>
                                    <Link href="/account/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sm font-medium text-stone-600 hover:text-brand-800">
                                        <Heart className="h-4 w-4" /> Wishlist
                                    </Link>
                                    <div className="h-px bg-stone-100 my-1" />
                                    <button
                                        onClick={() => { logout(); setMobileOpen(false); }}
                                        className="flex items-center gap-3 text-sm font-medium text-red-600 text-left"
                                    >
                                        <LogOut className="h-4 w-4" /> Sign Out ({user.name})
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-stone-500 hover:text-brand-800">
                                        Login
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-stone-500 hover:text-brand-800">
                                        Create Account
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
