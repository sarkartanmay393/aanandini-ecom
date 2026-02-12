'use client';

import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Shield } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const pathname = usePathname();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null; // login page handles its own rendering
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            A
                        </div>
                        <div>
                            <div className="font-bold text-sm">Anandibi</div>
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
                                {item.label}
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
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
