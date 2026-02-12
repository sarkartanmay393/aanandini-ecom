import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                A
                            </div>
                            <span className="text-lg font-bold text-white">Anandibi</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Your premium destination for curated products. Quality meets convenience.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Shop
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/products" className="text-sm hover:text-white transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-sm hover:text-white transition-colors">
                                    Cart
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Account
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/login" className="text-sm hover:text-white transition-colors">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="text-sm hover:text-white transition-colors">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Info
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <span className="text-sm">About Us</span>
                            </li>
                            <li>
                                <span className="text-sm">Contact</span>
                            </li>
                            <li>
                                <span className="text-sm">Privacy Policy</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-800 text-center text-sm">
                    © {new Date().getFullYear()} Anandibi. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
