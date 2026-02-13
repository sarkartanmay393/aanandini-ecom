'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import { getWishlist, removeFromWishlist } from '@/lib/api';
import { Heart, ArrowLeft, ShoppingCart, Trash2, Loader2 } from 'lucide-react';

export default function WishlistPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const { addItem } = useCart();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !token) { router.replace('/login?redirect=/account/wishlist'); return; }
        load();
    }, [user, token]);

    async function load() {
        if (!token) return;
        setLoading(true);
        try {
            const data = await getWishlist(token);
            setItems(data);
        } catch { } finally { setLoading(false); }
    }

    async function handleRemove(productId: string) {
        if (!token) return;
        setRemoving(productId);
        try {
            await removeFromWishlist(token, productId);
            setItems(items.filter((i) => i.productId !== productId));
        } catch { } finally { setRemoving(null); }
    }

    function handleAddToCart(product: any) {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
        });
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
            <Link href="/account" className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 mb-4">
                <ArrowLeft className="h-4 w-4" /> Account
            </Link>
            <h1 className="text-3xl font-serif text-stone-900 mb-2">My Wishlist</h1>
            <p className="text-stone-500 mb-8 text-sm">Products you&apos;ve saved for later</p>

            {loading ? (
                <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-stone-400" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                    <Heart className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p className="font-serif text-lg text-stone-500">Your wishlist is empty</p>
                    <p className="text-sm mb-4">Browse our collection and save your favorites</p>
                    <Link href="/products" className="px-6 py-2.5 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800 transition-colors inline-block">
                        Browse Collection
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden group">
                            <Link href={`/products/${item.product.id}`} className="block">
                                <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                                    <img
                                        src={item.product.images?.[0] || ''}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </Link>
                            <div className="p-4">
                                <Link href={`/products/${item.product.id}`}>
                                    <h3 className="text-sm font-serif font-medium text-stone-800 hover:text-brand-700 line-clamp-2">{item.product.name}</h3>
                                </Link>
                                <p className="text-xs text-brand-600 mt-1">{item.product.category?.name}</p>
                                <p className="text-lg font-serif font-bold text-stone-900 mt-2">₹{item.product.price.toLocaleString('en-IN')}</p>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleAddToCart(item.product)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                                    </button>
                                    <button
                                        onClick={() => handleRemove(item.productId)}
                                        disabled={removing === item.productId}
                                        className="px-3 py-2 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 transition-colors"
                                    >
                                        {removing === item.productId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
