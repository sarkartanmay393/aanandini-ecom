import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-stone-900 text-stone-400 mt-auto border-t border-stone-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1 space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-serif font-bold text-white tracking-tight">Aanandini</span>
                            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-stone-500 font-medium">Handloom Sarees</span>
                        </div>
                        <p className="text-sm font-light leading-relaxed text-stone-400">
                            Celebrating the timeless art of Indian handloom. Each saree tells a story of tradition, woven with love and precision.
                        </p>
                    </div>

                    {/* Collection */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-6">
                            Collection
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/products?category=banarasi" className="text-sm hover:text-brand-300 transition-colors">
                                    Banarasi Silk
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=kanjivaram" className="text-sm hover:text-brand-300 transition-colors">
                                    Kanjivaram
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=chanderi" className="text-sm hover:text-brand-300 transition-colors">
                                    Chanderi
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-sm hover:text-brand-300 transition-colors">
                                    View All
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-6">
                            Customer Care
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/login" className="text-sm hover:text-brand-300 transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-sm hover:text-brand-300 transition-colors">
                                    Shopping Cart
                                </Link>
                            </li>
                            <li>
                                <span className="text-sm cursor-pointer hover:text-brand-300 transition-colors">Shipping Policy</span>
                            </li>
                            <li>
                                <span className="text-sm cursor-pointer hover:text-brand-300 transition-colors">Returns & Exchange</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact (Placeholder) */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-6">
                            Contact Us
                        </h3>
                        <ul className="space-y-3">
                            <li className="text-sm">support@aanandini.com</li>
                            <li className="text-sm">+91 98765 43210</li>
                            <li className="text-sm pt-2 text-stone-500">
                                Mon - Sat: 10am - 7pm
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light tracking-wide text-stone-500">
                    <p>© {new Date().getFullYear()} Aanandini Handlooms. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-stone-300">Privacy</span>
                        <span className="cursor-pointer hover:text-stone-300">Terms</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
