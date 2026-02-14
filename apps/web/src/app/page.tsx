'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, Shield } from 'lucide-react';
import { Button } from '@aanandini/ui';
import { ProductCard } from '@/components/product-card';
import { useEffect, useState } from 'react';
import * as api from '@/lib/api';

// Fallback images for categories without product images
const FALLBACK_IMAGES: Record<string, string> = {
    banarasi: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop',
    kanjivaram: 'https://images.unsplash.com/photo-1583391726247-bdea2279d07d?q=80&w=1000&auto=format&fit=crop',
    chanderi: 'https://images.unsplash.com/photo-1605218427368-35b019b8eacf?q=80&w=1000&auto=format&fit=crop',
    wedding: 'https://images.unsplash.com/photo-1595991209284-936f53c5d2c1?q=80&w=1000&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
};

export default function HomePage() {
    const [products, setProducts] = useState<api.Product[]>([]);
    const [categories, setCategories] = useState<api.Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getProducts({ limit: 8 }).then((res) => setProducts(res.data)),
            api.getCategories().then(setCategories),
        ])
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="animate-fade-in pb-20">
            {/* Hero Section */}
            <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center bg-stone-900">
                {/* Background Image (Placeholder for now, using a high-quality drape texture or model) */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop"
                        alt="Hero Background"
                        className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/30" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-6 space-y-6">
                    <div className="inline-block border border-white/30 px-4 py-1.5 rounded-full backdrop-blur-sm mb-4">
                        <span className="text-xs uppercase tracking-[0.2em] text-white font-medium">New Collection 2025</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight animate-slide-up">
                        Weaving <span className="italic text-brand-300">Tradition</span><br />
                        Into Elegance
                    </h1>
                    <p className="text-lg md:text-xl text-stone-200 font-light max-w-xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Discover the finest handloom sarees, crafted by master artisans from the heart of India.
                    </p>
                    <div className="pt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link href="/products">
                            <Button size="lg" className="bg-white text-stone-900 hover:bg-brand-50 rounded-none px-8 py-6 text-sm uppercase tracking-widest font-bold">
                                Shop The Collection
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Strip (Minimal) */}
            <section className="border-b border-stone-200 bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-stone-100">
                        <div className="px-4 py-2">
                            <h3 className="font-serif text-lg text-stone-900 mb-1">Authentic Handloom</h3>
                            <p className="text-sm text-stone-500 font-light">Certified sourced directly from weavers</p>
                        </div>
                        <div className="px-4 py-2">
                            <h3 className="font-serif text-lg text-stone-900 mb-1">Free Shipping</h3>
                            <p className="text-sm text-stone-500 font-light">On all domestic orders above ₹999</p>
                        </div>
                        <div className="px-4 py-2">
                            <h3 className="font-serif text-lg text-stone-900 mb-1">Secure Payment</h3>
                            <p className="text-sm text-stone-500 font-light">100% secure payment gateway</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curated Collections (Bento Grid) */}
            <section className="py-24 bg-stone-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-800">Curated For You</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mt-3">Shop By Category</h2>
                        <div className="h-1 w-20 bg-brand-800 mx-auto mt-6" />
                    </div>

                    {categories.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[220px]">
                            {categories.slice(0, 5).map((cat, idx) => {
                                const coverImg = (cat as any).products?.[0]?.images?.[0]
                                    || FALLBACK_IMAGES[cat.slug]
                                    || FALLBACK_IMAGES.default;
                                // Bento sizing: first item is 2x2, others fill 1x1 or span
                                const spanClass = idx === 0
                                    ? 'col-span-2 row-span-2'
                                    : idx === 3
                                        ? 'col-span-2 md:col-span-1'
                                        : '';
                                return (
                                    <div key={cat.id} className={`group relative overflow-hidden rounded-lg ${spanClass}`}>
                                        <img src={coverImg} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.name} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-colors" />
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <h3 className={`font-serif ${idx === 0 ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>{cat.name}</h3>
                                            <Link href={`/products?category=${cat.slug}`} className="text-xs uppercase tracking-wider underline underline-offset-4 decoration-white/0 group-hover:decoration-white transition-all mt-1 inline-block">
                                                Explore &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-stone-400 font-serif italic">Loading collections...</div>
                    )}
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-800">New Arrivals</span>
                            <h2 className="text-3xl font-serif text-stone-900 mt-2">Trending This Season</h2>
                        </div>
                        <Link href="/products">
                            <Button variant="outline" className="rounded-none border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all uppercase tracking-wider text-xs px-6">
                                View All Products
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse space-y-4">
                                    <div className="aspect-[3/4] bg-stone-200 rounded-sm" />
                                    <div className="h-4 bg-stone-200 w-2/3 mx-auto" />
                                    <div className="h-4 bg-stone-200 w-1/3 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
                            {products.map((product, i) => (
                                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-stone-50">
                            <p className="text-stone-500 font-serif text-xl italic">Our shelves are being restocked with beauty.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="py-24 bg-stone-900 text-center px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-serif text-white">Join The Aanandini Family</h2>
                    <p className="text-stone-400 font-light text-lg">Subscribe to receive updates about new collections, exclusive access to sales, and stories from our weavers.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="bg-white/10 border border-white/20 text-white placeholder:text-stone-500 px-6 py-3 w-full sm:w-80 outline-none focus:border-brand-500 transition-colors rounded-none"
                        />
                        <Button className="rounded-none bg-brand-700 hover:bg-brand-800 text-white px-8 py-3 uppercase tracking-widest text-xs font-bold">
                            Subscribe
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
