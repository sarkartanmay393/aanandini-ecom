'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Input } from '@aanandini/ui';
import { ProductCard } from '@/components/product-card';
import * as api from '@/lib/api';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name';

export default function ProductsPage() {
    const [products, setProducts] = useState<api.Product[]>([]);
    const [categories, setCategories] = useState<api.Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<api.ProductsResponse['meta'] | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sort, setSort] = useState<SortOption>('newest');
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Load categories once
    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    // Load products on filter change
    useEffect(() => {
        setLoading(true);
        api
            .getProducts({ search: search || undefined, categoryId: categoryId || undefined, page, limit: 12 })
            .then((res) => {
                let sorted = [...res.data];
                switch (sort) {
                    case 'price-asc':
                        sorted.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-desc':
                        sorted.sort((a, b) => b.price - a.price);
                        break;
                    case 'name':
                        sorted.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                }
                setProducts(sorted);
                setMeta(res.meta);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [search, categoryId, page, sort]);

    // Debounce search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
                    <p className="mt-2 text-slate-500">Browse our complete collection</p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Search & Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search products..."
                            value={searchInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortOption)}
                            className="h-10 appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-10 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name">Name: A-Z</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Filter toggle (mobile) */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden flex items-center gap-2 h-10 px-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 shadow-sm"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 shrink-0`}>
                        <div className="sticky top-24 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3">Categories</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => { setCategoryId(''); setPage(1); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryId
                                            ? 'bg-brand-50 text-brand-700 font-medium'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setCategoryId(cat.id); setPage(1); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === cat.id
                                                ? 'bg-brand-50 text-brand-700 font-medium'
                                                : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {cat.name}
                                            {cat._count && (
                                                <span className="ml-1 text-xs text-slate-400">
                                                    ({cat._count.products})
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
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
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product, i) => (
                                        <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {meta && meta.totalPages > 1 && (
                                    <div className="mt-10 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-slate-500 px-4">
                                            Page {meta.page} of {meta.totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                            disabled={page >= meta.totalPages}
                                            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-lg text-slate-600 font-medium">No products found</p>
                                <p className="text-slate-400 mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
