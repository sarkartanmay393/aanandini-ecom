'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, Shield } from 'lucide-react';
import { Button } from '@aanandini/ui';
import { ProductCard } from '@/components/product-card';
import { useEffect, useState } from 'react';
import * as api from '@/lib/api';

export default function HomePage() {
    const [products, setProducts] = useState<api.Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .getProducts({ limit: 8 })
            .then((res) => setProducts(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-purple-900">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm text-brand-200 border border-white/10">
                            <Sparkles className="h-4 w-4" />
                            <span>Premium Quality Products</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                            Discover Products{' '}
                            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                                You&apos;ll Love
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-lg">
                            Curated collections of premium products delivered to your doorstep. Experience shopping
                            redefined with Aanandini.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Link href="/products">
                                <Button size="lg" className="gap-2 w-full sm:w-auto">
                                    Shop Now
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <Truck className="h-5 w-5 text-brand-600" />
                            <span className="text-sm font-medium text-slate-700">Free Shipping over ₹999</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Shield className="h-5 w-5 text-brand-600" />
                            <span className="text-sm font-medium text-slate-700">Secure Payments</span>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Sparkles className="h-5 w-5 text-brand-600" />
                            <span className="text-sm font-medium text-slate-700">Premium Quality</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                Featured Products
                            </h2>
                            <p className="mt-2 text-slate-500">Handpicked selections just for you</p>
                        </div>
                        <Link href="/products">
                            <Button variant="ghost" className="gap-1 hidden sm:inline-flex">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-slate-200" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-3 w-16 bg-slate-200 rounded" />
                                        <div className="h-4 w-3/4 bg-slate-200 rounded" />
                                        <div className="h-3 w-full bg-slate-200 rounded" />
                                        <div className="h-5 w-20 bg-slate-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map((product, i) => (
                                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-slate-500 text-lg">No products available yet.</p>
                            <p className="text-slate-400 text-sm mt-2">Check back soon for exciting new arrivals!</p>
                        </div>
                    )}

                    <div className="mt-8 text-center sm:hidden">
                        <Link href="/products">
                            <Button variant="outline" className="gap-1">
                                View All Products <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="bg-gradient-to-r from-brand-600 to-purple-600">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Ready to Start Shopping?
                    </h2>
                    <p className="text-brand-100 mb-8 max-w-md mx-auto">
                        Create your account today and unlock exclusive deals and offers.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
