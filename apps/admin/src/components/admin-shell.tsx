'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Shield, Tag, Menu, X } from 'lucide-react';
import * as api from '@/lib/api';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/categories', label: 'Categories', icon: Tag },
    { href: '/orders', label: 'Orders', icon: ShoppingCart, badge: true },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
    const { user, token, isLoading, logout } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingOrders, setPendingOrders] = useState(0);

    // Fetch pending orders count
    useEffect(() => {
        if (!token) return;
        api.getStats(token).then((stats) => {
            setPendingOrders(stats.pendingOrders || 0);
        }).catch(() => { });
    }, [token, pathname]);

    // Close sidebar on navigation
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        A
                    </div>
                    <div>
                        <div className="font-bold text-sm">Aanandini</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Shield className="h-3 w-3" /> Admin Panel
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-brand-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && pendingOrders > 0 && (
                                <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1.5">
                                    {pendingOrders > 99 ? '99+' : pendingOrders}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-medium">
                        {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors w-full"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - desktop */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col shrink-0 sticky top-0 h-screen">
                <SidebarContent />
            </aside>

            {/* Sidebar - mobile drawer */}
            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-slate-400 hover:text-white p-1"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <SidebarContent />
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto min-w-0">
                {/* Mobile header */}
                <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 md:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-700 hover:text-slate-900"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            A
                        </div>
                        <span className="font-bold text-sm text-slate-900">Aanandini Admin</span>
                    </div>
                    {pendingOrders > 0 && (
                        <Link href="/orders" className="ml-auto flex items-center gap-1 text-xs text-rose-600 font-medium">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                {pendingOrders}
                            </span>
                        </Link>
                    )}
                </div>
                <div className="p-4 sm:p-6 md:p-8">{children}</div>
            </main>
        </div>
    );
}
